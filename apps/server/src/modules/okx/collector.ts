import { getAggregator } from "../ticker/candle-agg";
import { OKX_WS_URL, OKX_PAIRS } from "./constant";
import { resolveOkxAgent } from "./okxProxyPlugin";

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
        return new Promise((resolve) => {
            console.log('[OKX] Connection URL:', OKX_WS_URL);
            const agent = resolveOkxAgent();
            this.ws = new WebSocket(OKX_WS_URL, { agent } as any);

            this.ws.onopen = () => {
                console.log('[OKX] Connected');

                // Subscribe to tickers
                // Convert internal symbols (SOL_USDT) to OKX symbols (SOL-USDT)
                // OKX format: { channel: "tickers", instId: "BTC-USDT" }
                const args = this.symbols
                    .filter(Boolean)
                    .map(s => {
                        // Use strict mapping from OKX_PAIRS
                        const normalizedKey = s.toLowerCase(); // sol_usdt
                        const instId = (OKX_PAIRS as any)[normalizedKey];

                        if (!instId) {
                            console.warn(`[OKX] No mapping found for symbol: ${s}`);
                            return null;
                        }

                        return {
                            channel: "tickers",
                            instId: instId
                        };
                    })
                    .filter(Boolean); // Filter out nulls

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

                        // Reverse map: SOL-USDT -> SOLUSDT / SOL_USDT
                        // We need the internal canonical symbol (e.g. SOLUSDT as used in other modules)
                        // If we used the map for subscription, we can just strip hyphens for canonical or look it up.
                        // For canonical redis purposes, we just want 'SOLUSDT' (uppercase, no separator)
                        const internalSymbol = instId.replace(/-/g, '').replace(/_/g, '').toUpperCase();

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
