import { getAggregator } from "../ticker/candle-agg";
import { KUCOIN_BULLET_URL } from "./constant";

export class KucoinTickerCollector {
  private ws: WebSocket | null = null;
  private pingInterval: number | null = null;
  private reconnectTimer: number | null = null;
  private isRunning = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private wsUrl: string | null = null;

  private symbols: string[];

  constructor(symbols: string[]) {
    this.symbols = symbols;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    await this.refreshToken();
    if (!this.wsUrl) throw new Error('Failed to get KuCoin WS token');
    await this.connect();
  }

  async stop() {
    this.isRunning = false;
    if (this.pingInterval) { 
      clearInterval(this.pingInterval); 
      this.pingInterval = null; 
    }
    if (this.reconnectTimer) { 
      clearTimeout(this.reconnectTimer); 
      this.reconnectTimer = null; 
    }
    try { this.ws?.close(); } catch {}
    this.ws = null;
  }

  private async refreshToken() {
    try {
      const resp = await fetch(KUCOIN_BULLET_URL, { method: 'POST' });
      const json = await resp.json() as any;
      
      if (json?.code !== '200000' || !json?.data) {
        throw new Error('Invalid KuCoin bullet response');
      }
      
      const { token, instanceServers } = json.data;
      const server = instanceServers?.[0];
      
      if (!token || !server?.endpoint) {
        throw new Error('Missing KuCoin bullet fields');
      }
      
      this.wsUrl = `${server.endpoint}?token=${token}`;
    } catch (error) {
      console.error('[KuCoin] Token refresh failed:', error);
      throw error;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts++), 30_000);
    console.log(`[KuCoin] Reconnecting in ${delay}ms...`);
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.refreshToken();
        await this.connect();
        this.reconnectAttempts = 0;
      } catch {
        this.scheduleReconnect();
      }
    }, delay) as unknown as number;
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.wsUrl) {
        reject(new Error("No WS URL available"));
        return;
      }

      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('[KuCoin] Connected');
        
        // Convert internal symbols (SOLUSDT) to KuCoin symbols (SOL-USDT)
        const topicSymbols = this.symbols
          .map(s => s.replace(/_/g, '').replace('USDT', '-USDT'))
          .filter(Boolean)
          .join(',');

        if (topicSymbols) {
          const sub = {
            id: Date.now(),
            type: 'subscribe',
            topic: `/market/ticker:${topicSymbols}`,
            response: true
          };
          this.ws!.send(JSON.stringify(sub));
        } else {
          console.warn('[KuCoin] No valid symbols to subscribe to');
        }

        // ping using KuCoin format
        this.pingInterval = setInterval(() => {
          try { 
            this.ws?.send?.(JSON.stringify({ id: Date.now(), type: 'ping' })); 
          } catch {}
        }, 30_000) as unknown as number;
        
        resolve();
      };

      this.ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(String(evt.data));
          
          // Filter for ticker messages
          if (msg.type !== 'message' || !msg.data || !msg.subject) {
             // console.log('[KuCoin] Ignored msg type:', msg.type);
             return;
          }
          
          // msg.topic is like "/market/ticker:SOL-USDT"
          // Extract symbol from topic
          const topic = msg.topic || '';
          const kucoinSymbol = topic.split(':').pop();
          
          if (!kucoinSymbol) return;

          // Reverse map: SOL-USDT -> SOLUSDT
          const internalSymbol = kucoinSymbol.replace(/-/g, '');
          
          const data = msg.data;
          const bid = Number(data.bestBid);
          const ask = Number(data.bestAsk);
          
          if (!isFinite(bid) || !isFinite(ask)) return;
          
          const price = (bid + ask) / 2;
          const time = Number(data.time) || Date.now();
          
          // Feed the aggregator
          getAggregator('kucoin', internalSymbol).tick(time, price, bid, ask);
        } catch (e) {
          console.warn('[KuCoin] Parse error:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.error('[KuCoin] WS Error:', err);
        if (!this.isRunning) return;
        // We don't reject here because the close handler will trigger reconnection
      };

      this.ws.onclose = () => {
        console.log('[KuCoin] Disconnected');
        if (!this.isRunning) return;
        this.scheduleReconnect();
      };
    });
  }
}
