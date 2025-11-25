import { Elysia, t } from 'elysia';
import { tickerRedis } from './ticker.redis.service';
import type { Exchange, Candle1s } from './type';
import { BINANCE_PAIRS } from '../binance/constant';

// List of supported exchanges for validation
const VALID_EXCHANGES = new Set<string>([
    'binance', 'kucoin', 'dydx', 'coinbase', 'jupiter'
]);

// Helper to track active subscriptions for cleanup
const subscriptions = new WeakMap<any, { close: () => void }>();

// Helper to normalize user symbol (SOL_USDT) to internal redis symbol (SOLUSDT)
// ARCHITECTURE NOTE:
// We use a "Canonical Symbol" (e.g. SOLUSDT) for all internal Redis keys.
// - Binance Collector converts its specific format -> SOLUSDT
// - KuCoin Collector converts its specific format -> SOLUSDT
// - This WS Controller converts User Input (SOL_USDT) -> SOLUSDT
// This way, we can easily add new exchanges without changing the WS logic,
// as long as their Collectors normalize to this same Canonical format.
function resolveInternalSymbol(userSymbol: string): string {
    const lower = userSymbol.toLowerCase();
    // 1. Try strict lookup in BINANCE_PAIRS
    // Since keys in BINANCE_PAIRS are like 'sol_usdt', we try to match that
    if (lower in BINANCE_PAIRS) {
        return (BINANCE_PAIRS as any)[lower];
    }
    // 2. Fallback: Remove underscores (SOL_USDT -> SOLUSDT)
    return userSymbol.replace(/_/g, '').toUpperCase();
}

export const tickerWsController = new Elysia()
    .ws('/ticker', {
        query: t.Object({
            exchanges: t.String({
                description: 'Comma-separated list of exchanges (e.g., "binance,kucoin")' 
            }),
            symbols: t.String({
                description: 'Comma-separated list of symbols (e.g., "SOL_USDT,ETH_USDT")'
            })
        }),

        async open(ws) {
            // 1. Parse and Validate Inputs
            const { exchanges: exchangesStr, symbols: symbolsStr } = ws.data.query;
            
            const requestedExchanges = exchangesStr.split(',')
                .map(s => s.trim().toLowerCase())
                .filter(s => VALID_EXCHANGES.has(s)) as Exchange[];

            const requestedSymbols = symbolsStr.split(',')
                .map(s => s.trim().toUpperCase())
                .filter(Boolean);

            if (requestedExchanges.length === 0 || requestedSymbols.length === 0) {
                ws.send({ error: 'No valid exchanges or symbols provided' });
                ws.close();
                return;
            }

            // 2. Initialize State
            // Structure: { "SOL_USDT": { "binance": Candle, "kucoin": Candle } }
            const connectionState: Record<string, Partial<Record<Exchange, Candle1s>>> = {};
            
            // Initialize empty objects for each symbol to ensure structure exists
            for (const sym of requestedSymbols) {
                connectionState[sym] = {};
            }

            const allUnsubs: Array<() => void> = [];

            // 3. Setup Subscriptions (Loop through Symbols x Exchanges)
            // We do this concurrently for speed
            await Promise.all(requestedSymbols.map(async (userSymbol) => {
                const internalSymbol = resolveInternalSymbol(userSymbol);

                // A. Initial Snapshot
                try {
                    const snapshot = await tickerRedis.getExchangesLatest(internalSymbol, requestedExchanges);
                    Object.entries(snapshot).forEach(([exch, candle]) => {
                        if (candle) {
                            if (!connectionState[userSymbol]) connectionState[userSymbol] = {};
                            connectionState[userSymbol]![exch as Exchange] = candle;
                        }
                    });
                } catch (e) {
                    console.warn(`[TickerWS] Snapshot failed for ${userSymbol}:`, e);
                }

                // B. Live Subscription
                const sub = await tickerRedis.subscribeExchangesLatest(
                    internalSymbol,
                    requestedExchanges,
                    (exchange, candle) => {
                        // Update State
                        if (!connectionState[userSymbol]) connectionState[userSymbol] = {};
                        connectionState[userSymbol]![exchange] = candle;

                        // Emit Update
                        // We emit an object keyed by the User Symbol that changed
                        // Format: { "SOL_USDT": { "binance": ..., "kucoin": ... } }
                        ws.send({
                            [userSymbol]: connectionState[userSymbol]
                        });
                    }
                );
                allUnsubs.push(sub.close);
            }));

            // 4. Send Initial Full Snapshot (All symbols)
            // So the UI draws immediately
            ws.send(connectionState);

            // 5. Register Cleanup
            subscriptions.set(ws, {
                close: () => allUnsubs.forEach(fn => fn())
            });
        },

        close(ws) {
            const sub = subscriptions.get(ws);
            if (sub) {
                sub.close();
                subscriptions.delete(ws);
            }
        }
    });