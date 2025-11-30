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
        console.log('[Binance] Connected');
        
        // Subscribe to all symbols
        // Normalize: SOL_USDT -> solusdt
        const params = this.symbols
            .filter(Boolean)
            .map(s => `${s.replace(/_/g, '').toLowerCase()}@bookTicker`);

        if (params.length === 0) {
            console.warn('[Binance] No symbols to subscribe to');
            return;
        }

        const sub = { 
            method: 'SUBSCRIBE', 
            params, 
            id: 1 
        };

        console.log(`[Binance] Subscribing to ${params.length} pairs:`, params);
        try {
            this?.ws?.send(JSON.stringify(sub));
        } catch (e) {
            console.error('[Binance] Failed to send subscription:', e);
        }

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
          
          const bid = Number(tick.bidPrice);
          const ask = Number(tick.askPrice);
          const price = (bid + ask) / 2;
          const time = tick.eventTime ?? Date.now();
          
          // Use the symbol from the tick data (normalized to uppercase)
          getAggregator('binance', tick.symbol.toUpperCase()).tick(time, price, bid, ask);
        } catch {}
      };

      this.ws.onerror = (err) => {
        console.error('[Binance] WS Error:', err);
        if (!this.isRunning) return;
        // reject(err); // Don't reject, just log. Reconnect is handled by onclose
      };

      this.ws.onclose = (evt) => {
        if (!this.isRunning) return;
        console.warn(`[Binance] Closed (Code: ${evt.code}, Reason: ${evt.reason}). Reconnecting...`);
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
