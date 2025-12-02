import type { Exchange, TickerData } from "../ticker/type";

export interface ArbitrageRoute {
    buyExchange: Exchange;
    sellExchange: Exchange;
    buyPrice: number;
    sellPrice: number;
    spread: number;
    spreadPercentage: number;
    buyFee: number;
    sellFee: number;
    totalFee: number;
    profit: number;
    profitPercentage: number;
    totalFeePercentage: number;
}

export interface ArbitrageOpportunity {
    hasOpportunity: boolean;
    bestRoute: ArbitrageRoute | null;
}

// Default taker fee rate (0.1%)
const DEFAULT_FEE_RATE = 0.001;

/**
 * Calculates the best arbitrage opportunity given a set of exchange prices.
 * 
 * @param prices Map of exchange name to TickerData
 * @param amount The amount of base asset to trade (default: 1)
 * @param feeRates Optional map of exchange specific fee rates (decimal, e.g. 0.001 for 0.1%)
 * @param minProfitPercent Optional minimum profit percentage threshold
 */
export function calculateArbitrageOpportunity(
    prices: Partial<Record<Exchange, TickerData>>,
    amount: number = 1,
    feeRates: Partial<Record<Exchange, number>> = {},
    minProfitPercent: number = 0
): ArbitrageOpportunity {
    const exchanges = Object.keys(prices) as Exchange[];
    const routes: ArbitrageRoute[] = [];

    // Compare every pair of exchanges
    for (const buyEx of exchanges) {
        for (const sellEx of exchanges) {
            if (buyEx === sellEx) continue;
            
            const buyTick = prices[buyEx];
            const sellTick = prices[sellEx];

            // Ensure we have valid data for both sides
            if (!buyTick?.bestAsk || !sellTick?.bestBid) continue;

            const buyPrice = buyTick.bestAsk;
            const sellPrice = sellTick.bestBid;

            // Calculate Spread
            const spread = sellPrice - buyPrice;
            const spreadPercentage = (spread / buyPrice) * 100;

            // Calculate Fees
            // Use provided rate or default
            const buyFeeRate = feeRates[buyEx] ?? DEFAULT_FEE_RATE;
            const sellFeeRate = feeRates[sellEx] ?? DEFAULT_FEE_RATE;

            const buyFee = buyPrice * amount * buyFeeRate;
            const sellFee = sellPrice * amount * sellFeeRate;
            const totalFee = buyFee + sellFee;

            // Calculate Profit
            const profit = (spread * amount) - totalFee;
            const profitPercentage = (profit / (buyPrice * amount)) * 100;
            const totalFeePercentage = (totalFee / (buyPrice * amount)) * 100;

            routes.push({
                buyExchange: buyEx,
                sellExchange: sellEx,
                buyPrice,
                sellPrice,
                spread,
                spreadPercentage,
                buyFee,
                sellFee,
                totalFee,
                profit,
                profitPercentage,
                totalFeePercentage
            });
        }
    }

    if (routes.length === 0) {
        return { hasOpportunity: false, bestRoute: null };
    }

    // Find the route with the highest profit percentage
    const bestRoute = routes.reduce((prev, current) => 
        (current.profitPercentage > prev.profitPercentage) ? current : prev
    );

    const hasOpportunity = bestRoute.profitPercentage >= minProfitPercent;

    return {
        hasOpportunity,
        bestRoute
    };
}
