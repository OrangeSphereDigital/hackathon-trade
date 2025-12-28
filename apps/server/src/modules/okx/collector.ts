import { getAggregator } from "../ticker/candle-agg";
import { OKX_WS_URL } from "./constant";

export class OkxTickerCollector {
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
            console.log('[OKX] Connection URL:', OKX_WS_URL);
            this.ws = new WebSocket(OKX_WS_URL);

            this.ws.onopen = () => {
                console.log('[OKX] Connected');

                // Subscribe to tickers
                // Convert internal symbols (SOL_USDT) to OKX symbols (SOL-USDT)
                // OKX format: { channel: "tickers", instId: "BTC-USDT" }
                const args = this.symbols
                    .filter(Boolean)
                    .map(s => {
                        const instId = s.replace(/_/g, '-'); // SOL_USDT -> SOL-USDT
                        return {
                            channel: "tickers",
                            instId: instId
                        };
                    });

                if (args.length === 0) {
                    console.warn('[OKX] No symbols to subscribe to');
                    return;
                }

                const sub = {
                    op: "subscribe",
                    args: args
                };

                console.log(`[OKX] Subscribing to ${args.length} pairs`);
                try {
                    this.ws?.send(JSON.stringify(sub));
                } catch (e) {
                    console.error('[OKX] Failed to send subscription:', e);
                }

                // Setup Ping
                this.pingInterval = setInterval(() => {
                    try {
                        if (this.ws?.readyState === WebSocket.OPEN) {
                            this.ws.send("ping");
                        }
                    } catch (e) {
                        console.error('[OKX] Ping failed:', e);
                    }
                }, 20000) as unknown as number; // 20s interval

                resolve();
            };

            this.ws.onmessage = (evt) => {
                try {
                    const dataStr = String(evt.data);
                    if (dataStr === "pong") {
                        // console.log('[OKX] Pong received');
                        return;
                    }

                    const msg = JSON.parse(dataStr);

                    // Handle Subscription Confirmation 
                    if (msg.event === "subscribe") {
                        // console.log('[OKX] Subscribed to', msg.arg?.instId);
                        return;
                    }

                    // Handle Ticker Data
                    // Structure: { arg: { channel: 'tickers', instId: 'BTC-USDT' }, data: [ { ... } ] }
                    if (msg.data && Array.isArray(msg.data) && msg.data.length > 0) {
                        const tickerData = msg.data[0];
                        const instId = tickerData.instId; // BTC-USDT
                        if (!instId) return;

                        // Parse
                        const bid = Number(tickerData.bidPx);
                        const ask = Number(tickerData.askPx);
                        const ts = Number(tickerData.ts);

                        if (isNaN(bid) || isNaN(ask)) return;

                        const price = (bid + ask) / 2; // Mid price
                        const time = ts || Date.now();

                        // Convert to internal symbol: BTC-USDT -> BTCUSDT
                        const internalSymbol = instId.replace(/-/g, '');

                        getAggregator('okx', internalSymbol).tick(time, price, bid, ask);
                    }

                } catch (e) {
                    console.error('[OKX] Message processing error:', e);
                }
            };

            this.ws.onerror = (err) => {
                console.error('[OKX] WS Error:', err);
                if (!this.isRunning) return;
            };

            this.ws.onclose = (evt) => {
                if (this.pingInterval) {
                    clearInterval(this.pingInterval);
                    this.pingInterval = null;
                }
                if (!this.isRunning) return;
                console.warn(`[OKX] Closed (Code: ${evt.code}). Reconnecting...`);
                setTimeout(() => this.connect().catch(() => { }), 1000);
            };
        });
    }
}
