import { bnbClient } from "@/lib/bnbClient";
import { EXCHANGES, SYMBOL_PAIRS } from "../../constants/constant";
import { calculateArbitrageOpportunity, type ArbitrageRoute } from "./arbitrage.utils";
import { tickerRedis } from "../ticker/ticker.redis.service";
import type { Exchange, TickerData } from "../ticker/type";
import { parseEther, Interface } from "ethers";

const MIN_PROFIT_THRESHOLD = 0.5;
const EXECUTION_COOLDOWN_MS = 60000;
const ARBITRAGE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

const ARBITRAGE_ABI = [
    "function recordOpportunity(string symbol, string buyExchange, string sellExchange, uint256 buyPrice, uint256 sellPrice, uint256 profit)"
];

const lastExecutionTime: Record<string, number> = {};
let unsubs: Array<() => void> = [];
let isRunning = false;

export async function startArbitrageBot() {
    if (isRunning) return;
    isRunning = true;
    console.log("[ArbitrageExecutor] Starting bot...");

    const exchanges = Object.values(EXCHANGES) as Exchange[];
    const symbols = Object.values(SYMBOL_PAIRS).map(s => s.replace(/_/g, '').toUpperCase());

    await Promise.all(symbols.map(async (symbol) => {
        // Subscribe to updates and check immediately on every tick
        const sub = await tickerRedis.subscribeExchangesLatest(symbol, exchanges, async () => {
            // Stateless check: Fetch fresh data from Redis directly
            const rawPrices = await tickerRedis.getExchangesLatest(symbol, exchanges);

            // Filter out null candles to satisfy calculateArbitrageOpportunity typing
            const prices: Partial<Record<Exchange, TickerData>> = {};
            for (const [ex, candle] of Object.entries(rawPrices)) {
                if (candle) {
                    prices[ex as Exchange] = candle;
                }
            }

            // Reuse existing detector
            const opportunity = calculateArbitrageOpportunity(prices);

            if (opportunity.hasOpportunity && opportunity.bestRoute) {
                const { profit } = opportunity.bestRoute;
                const now = Date.now();
                const lastRun = lastExecutionTime[symbol] || 0;

                if (profit > MIN_PROFIT_THRESHOLD && (now - lastRun > EXECUTION_COOLDOWN_MS)) {
                    lastExecutionTime[symbol] = now;
                    await writeArbitrageToBlockchain(symbol, opportunity.bestRoute);
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
    console.log("[ArbitrageExecutor] Bot stopped.");
}

async function writeArbitrageToBlockchain(symbol: string, route: ArbitrageRoute) {
    console.log(`[ArbitrageExecutor] 🔗 Found Profit $${route.profit.toFixed(2)} on ${symbol}. Writing to chain...`);
    
    try {
        const iface = new Interface(ARBITRAGE_ABI);
        const calldata = iface.encodeFunctionData("recordOpportunity", [
            symbol,
            route.buyExchange,
            route.sellExchange,
            parseEther(route.buyPrice.toFixed(18)),
            parseEther(route.sellPrice.toFixed(18)),
            parseEther(route.profit.toFixed(18))
        ]);

        const signer = bnbClient.getSigner();
        const tx = await signer.sendTransaction({
            to: ARBITRAGE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" ? signer.address : ARBITRAGE_CONTRACT_ADDRESS,
            data: calldata,
            value: 0
        });
        
        console.log(`[ArbitrageExecutor] ✅ Tx Sent: ${tx.hash}`);
    } catch (error) {
        console.error(`[ArbitrageExecutor] ❌ Tx Failed:`, error);
    }
}
