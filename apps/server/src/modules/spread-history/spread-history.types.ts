import type { Exchange } from "../ticker/type";

export interface SpreadSample {
  symbol: string; // user symbol, e.g. SOL_USDT
  buyExchange: Exchange;
  sellExchange: Exchange;
  spreadPercentage: number;
  ts?: number; // epoch ms UTC
}

export interface SpreadHistorySummary {
  symbol: string;
  buyExchange: Exchange;
  sellExchange: Exchange;
  last1h: {
    maxSpreadPercentage: number | null;
    maxTs: number | null;
  };
  last24h: {
    maxSpreadPercentage: number | null;
    maxTs: number | null;
  };
}
