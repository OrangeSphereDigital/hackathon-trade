import { bnbClient } from "@/lib/bnbClient";
import prisma from "@root/db";
import { EXCHANGES, SYMBOL_PAIRS } from "../../constants/constant";
import { calculateArbitrageOpportunity, type ArbitrageRoute } from "./arbitrage.utils";
import { tickerRedis } from "../ticker/ticker.redis.service";
import type { Exchange, TickerData } from "../ticker/type";
import { Contract, parseEther } from "ethers";
import { env } from "@/constants/env";
import { arbitrageStatus } from "./arbitrage.status.service";

const MIN_PROFIT_THRESHOLD = 0.1;
const EXECUTION_COOLDOWN_MS = 60000;
const ARBITRAGE_CONTRACT_ADDRESS = env.BNB_TEST_NET_CONTRACT_ADDRESS;

const DEFAULT_SIMULATION_TRADE_AMOUNT_USD = 100;

const ARBITRAGE_ABI = [
    "function recordOpportunity(string symbol, string buyExchange, string sellExchange, uint256 buyPrice, uint256 sellPrice, uint256 profit, uint256 totalFee)"
];

const lastExecutionTime: Record<string, number> = {};
let unsubs: Array<() => void> = [];
let isRunning = false;

export async function startArbitrageBot() {
    if (isRunning) return;
    if (!ARBITRAGE_CONTRACT_ADDRESS) {
        console.error(
            "[ArbitrageExecutor] Missing BNB_TEST_NET_CONTRACT_ADDRESS. On-chain logging is disabled."
        );
    }
    isRunning = true;
    arbitrageStatus.setStatus({ isRunning: true });
    const logStart = "[ArbitrageExecutor] Starting bot...";
    console.log(logStart);
    arbitrageStatus.addLog('info', logStart);

    const exchanges = Object.values(EXCHANGES) as Exchange[];
    const symbols = Object.values(SYMBOL_PAIRS).map(s => s.replace(/_/g, '').toUpperCase());

    await Promise.all(symbols.map(async (symbol) => {
        // Subscribe to updates and check immediately on every tick
        const sub = await tickerRedis.subscribeExchangesLatest(symbol, exchanges, async () => {
            // Update heartbeat to show we are alive and checking
            arbitrageStatus.updateLastCheck();

            // Stateless check: Fetch fresh data from Redis directly
            const rawPrices = await tickerRedis.getExchangesLatest(symbol, exchanges);

            // Filter out null candles to satisfy calculateArbitrageOpportunity typing
            const prices: Partial<Record<Exchange, TickerData>> = {};
            for (const [ex, candle] of Object.entries(rawPrices)) {
                if (candle) {
                    prices[ex as Exchange] = candle;
                }
            }

            // ^ Add data in simulator for analysis
            // Reuse existing detector
            const opportunity = calculateArbitrageOpportunity(prices);

            if (opportunity.hasOpportunity && opportunity.bestRoute) {
                // Update status for monitoring
                arbitrageStatus.updateOpportunity(symbol, opportunity.bestRoute);

                const { profit } = opportunity.bestRoute;
                const now = Date.now();
                const lastRun = lastExecutionTime[symbol] || 0;

                if (profit > MIN_PROFIT_THRESHOLD && (now - lastRun > EXECUTION_COOLDOWN_MS)) {
                    lastExecutionTime[symbol] = now;

                    // 1. Store in DB
                    const record = await prisma.arbitrageOpportunity.create({
                        data: {
                            symbol: symbol,
                            buyExchange: opportunity.bestRoute.buyExchange,
                            sellExchange: opportunity.bestRoute.sellExchange,
                            buyPrice: opportunity.bestRoute.buyPrice,
                            sellPrice: opportunity.bestRoute.sellPrice,
                            profit: opportunity.bestRoute.profit,
                            totalFee: (opportunity.bestRoute).totalFee ?? 0,
                            status: "DETECTED"
                        }
                    });

                    // 1.1 Store simulated trade (1:1) for dashboard simulation
                    const amountUsdRaw = Number(env.SIMULATION_TRADE_AMOUNT_USD);
                    const amountUsd = Number.isFinite(amountUsdRaw)
                        ? amountUsdRaw
                        : DEFAULT_SIMULATION_TRADE_AMOUNT_USD;

                    const buyPrice = opportunity.bestRoute.buyPrice;
                    const sellPrice = opportunity.bestRoute.sellPrice;
                    const totalFeePerBase = (opportunity.bestRoute as any).totalFee ?? 0;

                    // Convert USD to base amount using the buy price
                    const amountBase = buyPrice > 0 ? amountUsd / buyPrice : 0;
                    const estimatedProfit = ((sellPrice - buyPrice) * amountBase) - (totalFeePerBase * amountBase);

                    await prisma.simulatedTrade.create({
                        data: {
                            opportunityId: record.id,
                            symbol,
                            buyExchange: opportunity.bestRoute.buyExchange,
                            sellExchange: opportunity.bestRoute.sellExchange,
                            buyPrice,
                            sellPrice,
                            amountUsd,
                            estimatedProfit,
                        },
                    });

                    const logSaved = `[ArbitrageExecutor] 💾 Saved opportunity to DB: ${record.id}`;
                    console.log(logSaved);
                    arbitrageStatus.addLog('info', logSaved);

                    // 2. Execute on Chain
                    await writeArbitrageToBlockchain(symbol, opportunity.bestRoute, record.id);
                }
            }
        });
        unsubs.push(sub.close);
    }));
}

export function stopArbitrageBot() {
    unsubs.forEach(fn => fn());
    unsubs = [];
    isRunning = false;
    arbitrageStatus.setStatus({ isRunning: false });
    const logStop = "[ArbitrageExecutor] Bot stopped.";
    console.log(logStop);
    arbitrageStatus.addLog('info', logStop);
}

async function writeArbitrageToBlockchain(symbol: string, route: ArbitrageRoute, dbId: string) {
    const logFound = `[ArbitrageExecutor] 🔗 Found Profit $${route.profit.toFixed(2)} on ${symbol}. Writing to chain...`;
    console.log(logFound);
    arbitrageStatus.addLog('info', logFound);

    try {
        if (!ARBITRAGE_CONTRACT_ADDRESS) {
            throw new Error("BNB_TEST_NET_CONTRACT_ADDRESS is not set");
        }

        const signer = bnbClient.getSigner();

        const contract = new Contract(
            ARBITRAGE_CONTRACT_ADDRESS,
            ARBITRAGE_ABI,
            signer
        );

        const buyPriceWei = parseEther(route.buyPrice.toFixed(18));
        const sellPriceWei = parseEther(route.sellPrice.toFixed(18));
        const profitWei = parseEther(route.profit.toFixed(18));

        const totalFeeNumber = (route as any).totalFee ?? 0;
        const totalFeeWei = parseEther(totalFeeNumber.toFixed(18));

        const tx = await (contract as any).recordOpportunity(
            symbol,
            route.buyExchange,
            route.sellExchange,
            buyPriceWei,
            sellPriceWei,
            profitWei,
            totalFeeWei
        );

        const logTx = `[ArbitrageExecutor] ✅ Tx Sent: ${tx.hash}`;
        console.log(logTx);
        arbitrageStatus.addLog('info', logTx);

        // 3. Update DB with Tx Hash
        await prisma.arbitrageOpportunity.update({
            where: { id: dbId },
            data: {
                status: "ON_CHAIN",
                txHash: tx.hash,
                // blockNumber: tx.blockNumber // might not be available immediately without wait()
            }
        });

    } catch (error: any) {
        console.error(`[ArbitrageExecutor] ❌ Tx Failed:`, error);
        arbitrageStatus.addLog('error', `[ArbitrageExecutor] ❌ Tx Failed: ${error?.message || String(error)}`);
        
        // 4. Update DB with Error
        await prisma.arbitrageOpportunity.update({
            where: { id: dbId },
            data: {
                status: "FAILED",
                error: error?.message || String(error)
            }
        });
    }
}
