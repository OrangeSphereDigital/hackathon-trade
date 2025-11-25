import { getAggregator } from "../ticker/candle-agg";
import {BINANCE_WS_URL} from "./constant"
// import { getAggregator } from './candle-agg';

// Use global WebSocket from Bun
const WS_URL = BINANCE_WS_URL;


export class BinanceTickerCollector {
  private ws: WebSocket | null = null;
  private pingInterval: number | null = null;
  private isRunning = false;

  private symbols: string[];

  constructor(symbols: string[]) {
    this.symbols = symbols;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    await this.connect();
  }

  async stop() {
    this.isRunning = false;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        // Subscribe to all symbols
        const params = this.symbols.map(s => `${s.toLowerCase()}@bookTicker`);
        const sub = { method: 'SUBSCRIBE', params, id: 1 };
        this.ws!.send(JSON.stringify(sub));

        // ping every 30s
        this.pingInterval = setInterval(() => {
          try { this.ws?.send?.(JSON.stringify({ method: 'PING' })); } catch {}
        }, 30_000) as unknown as number;

        resolve();
      };

      this.ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(String(evt.data));
          const tick = parseBinanceBookTicker(msg);
          if (!tick) return;
          
          const price = (Number(tick.bidPrice) + Number(tick.askPrice)) / 2;
          const time = tick.eventTime ?? Date.now();
          
          // Use the symbol from the tick data (normalized to uppercase)
          getAggregator('binance', tick.symbol.toUpperCase()).tick(time, price);
        } catch {}
      };

      this.ws.onerror = (err) => {
        if (!this.isRunning) return;
        reject(err);
      };

      this.ws.onclose = () => {
        if (!this.isRunning) return;
        // simple reconnect
        setTimeout(() => this.connect().catch(() => {}), 1000);
      };
    });
  }
}

function parseBinanceBookTicker(d: any): { symbol: string; bidPrice: string; askPrice: string; eventTime?: number } | null {
  if (!d) return null;
  if (d.stream && d.data) d = d.data;
  // Support both bookTicker and 24hrTicker fallback
  const symbol = d.s || d.symbol;
  const bidPrice = d.b || d.bidPrice;
  const askPrice = d.a || d.askPrice;
  const eventTime = d.E || d.eventTime;
  if (!symbol || bidPrice == null || askPrice == null) return null;
  return { symbol, bidPrice, askPrice, eventTime };
}
