import React, { useMemo } from 'react';
import { useTickerWebSocket } from './useTickerWebSocket';
import { ArbitrageCard } from './ArbitrageCard';

interface LiveTickerProps {
    symbols?: string[];
    exchanges?: string[];
}

const DEFAULT_SYMBOLS = ['SOL_USDT', 'ETH_USDT', 'BTC_USDT', 'BNB_USDT'];
const DEFAULT_EXCHANGES = ['binance', 'kucoin', 'coinbase'];

export function LiveTicker({ 
    symbols = DEFAULT_SYMBOLS, 
    exchanges = DEFAULT_EXCHANGES 
}: LiveTickerProps) {
    const { data, status } = useTickerWebSocket({
        symbols,
        exchanges
    });

    const sortedSymbols = useMemo(() => {
        return Object.keys(data).sort();
    }, [data]);

    if (status === 'connecting' && Object.keys(data).length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
                Connecting to live feed...
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="p-8 text-center text-red-500">
                Failed to connect to ticker service.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Live Arbitrage Monitor</h2>
                <div className="flex items-center gap-2 text-xs">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-muted-foreground uppercase">Live</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedSymbols.map(symbol => (
                    <ArbitrageCard 
                        key={symbol} 
                        symbol={symbol} 
                        data={data[symbol]} 
                    />
                ))}
                
                {sortedSymbols.length === 0 && status === 'connected' && (
                   <div className="col-span-full text-center text-muted-foreground py-12">
                       Waiting for price updates...
                   </div>
                )}
            </div>
        </div>
    );
}
