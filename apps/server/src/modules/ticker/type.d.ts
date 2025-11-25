export type Exchange = 'binance' | 'kucoin' | 'dydx' | 'coinbase' | 'jupiter';

export interface Candle1s {
  time: number; // epoch seconds UTC
  open: number;
  high: number;
  low: number;
  close: number;
  type: "real" | "synthetic";
}

export interface CandleEvent {
  exchange: Exchange;
  symbol: string; // normalized symbol key, e.g., 'SOLUSDT'
  candle: Candle1s;
}
