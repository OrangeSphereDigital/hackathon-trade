import { Elysia, t } from 'elysia';
import { tickerRedis } from './ticker.redis.service';
import type { Exchange, Candle1s } from './type';

// List of supported exchanges for validation
const VALID_EXCHANGES = new Set<string>([
    'binance', 'kucoin', 'dydx', 'coinbase', 'jupiter'
]);

// Helper to track active subscriptions for cleanup
const subscriptions = new WeakMap<any, { close: () => Promise<void> | void }>();

export const tickerWsController = new Elysia()
    .ws('/ticker', {
        query: t.Object({
            exchanges: t.String({
                description: 'Comma-separated list of exchanges (e.g., "binance,kucoin")' 
            }),
            symbol: t.String({
                description: 'Trading pair symbol (e.g., "SOLUSDT")'
            })
        }),

        async open(ws) {
            // 1. Parse and Validate Inputs
            const { exchanges: exchangesStr, symbol: rawSymbol } = ws.data.query;
            const symbol = rawSymbol.toUpperCase();
            
            const requestedExchanges = exchangesStr.split(',')
                .map(s => s.trim().toLowerCase())
                .filter(s => VALID_EXCHANGES.has(s)) as Exchange[];

            if (requestedExchanges.length === 0) {
                ws.send({ error: 'No valid exchanges provided' });
                ws.close();
                return;
            }

            // 2. Initialize State
            // We maintain the latest known state for all requested exchanges
            // to send a "combined frame" on every update, which is convenient for the UI.
            const latestState: Partial<Record<Exchange, Candle1s>> = {};

            // 3. Send Initial Snapshot
            try {
                // Fetch latest available data from Redis
                const snapshot = await tickerRedis.getExchangesLatest(symbol, requestedExchanges);
                
                // Populate local state
                Object.entries(snapshot).forEach(([exch, candle]) => {
                    if (candle) {
                        latestState[exch as Exchange] = candle;
                    }
                });

                // Send snapshot if we have any data
                if (Object.keys(latestState).length > 0) {
                    // Determine the most recent timestamp to timestamp the frame
                    const maxTime = Math.max(...Object.values(latestState).map(c => c?.time || 0));
                    ws.send({
                        symbol,
                        t: maxTime,
                        ...latestState
                    });
                }
            } catch (error) {
                console.error('[TickerWS] Failed to send initial snapshot:', error);
            }

            // 4. Subscribe to Live Updates
            const sub = await tickerRedis.subscribeExchangesLatest(
                symbol,
                requestedExchanges,
                (exchange, candle) => {
                    // Update local state
                    latestState[exchange] = candle;

                    // Broadcast combined frame
                    ws.send({
                        symbol,
                        t: candle.time,
                        ...latestState
                    });
                }
            );

            // Register subscription for cleanup
            subscriptions.set(ws, sub);
        },

        close(ws) {
            const sub = subscriptions.get(ws);
            if (sub) {
                sub.close();
                subscriptions.delete(ws);
            }
        }
    });