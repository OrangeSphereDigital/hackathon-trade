export type Exchange = 'binance' | 'kucoin' | 'dydx' | 'coinbase' | 'jupiter' | 'okx';

export interface TickerData {
    time: number; // epoch seconds UTC
    bestBid: number; // Sell Price
    bestAsk: number; // Buy Price
    lastPrice: number; // Last Trade / Mid Price
    type: "real" | "synthetic";
}

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

export interface SymbolTickerData {
    prices: Partial<Record<Exchange, TickerData>>;
    arbitrage: ArbitrageOpportunity;
}

export type TickerUpdate = Array<Record<string, SymbolTickerData>>;
