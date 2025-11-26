export type Exchange = 'binance' | 'kucoin' | 'dydx' | 'coinbase' | 'jupiter';

export interface TickerData {
  time: number; // epoch seconds UTC
  bestBid: number; // Sell Price
  bestAsk: number; // Buy Price
  lastPrice: number; // Last Trade / Mid Price
  type: "real" | "synthetic";
}

export interface CandleEvent {
  exchange: Exchange;
  symbol: string; // normalized symbol key, e.g., 'SOLUSDT'
  candle: TickerData;
}
