import { useEffect, useState, useRef } from 'react';
import { client } from '@/lib/client';
import type { SymbolTickerData, TickerUpdate } from './types';

interface UseTickerWebSocketProps {
    symbols: string[];
    exchanges: string[];
    enabled?: boolean;
}

export function useTickerWebSocket({ symbols, exchanges, enabled = true }: UseTickerWebSocketProps) {
    const [data, setData] = useState<Record<string, SymbolTickerData>>({});
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const wsRef = useRef<any>(null);

    useEffect(() => {
        if (!enabled || symbols.length === 0 || exchanges.length === 0) {
            return;
        }

        setStatus('connecting');

        const sub = client.ticker.subscribe({
            query: {
                symbols: symbols.join(','),
                exchanges: exchanges.join(',')
            }
        });

        wsRef.current = sub;

        sub.subscribe((message: any) => {
            const updates = message.data as TickerUpdate;
            
            // message.data is the payload sent from server: [{ "SOL_USDT": { prices: ..., arbitrage: ... } }]
            if (Array.isArray(updates)) {
                setData(prev => {
                    const next = { ...prev };
                    updates.forEach(update => {
                        Object.entries(update).forEach(([symbol, symbolData]) => {
                            next[symbol] = symbolData;
                        });
                    });
                    return next;
                });
                setStatus('connected');
            }
        });

        return () => {
            // Cleanup
            // Note: Eden treaty subscription might handle cleanup differently depending on version,
            // but usually calling .close() or similar on the ws instance if exposed, or just letting the effect cleanup.
            // The returned object from client.ticker.subscribe() is a simplified WS wrapper.
            // Unfortunately Eden docs are sometimes sparse on explicit close(). 
            // Typically standard WS cleanup:
            // sub.ws.close() if available?
            // Looking at source, it often returns an object with .on, .send, .close
            try {
                // @ts-ignore
                if (sub && typeof sub.close === 'function') {
                     // @ts-ignore
                    sub.close();
                }
            } catch (e) {
                console.error("Error closing websocket", e);
            }
            setStatus('disconnected');
        };
    }, [enabled, symbols.join(','), exchanges.join(',')]);

    return { data, status };
}
