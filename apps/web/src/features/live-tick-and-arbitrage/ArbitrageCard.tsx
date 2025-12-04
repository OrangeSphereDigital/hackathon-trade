import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SymbolTickerData, Exchange } from './types';
import { SpreadPct } from './SpreadPct';

interface ArbitrageCardProps {
    symbol: string;
    data: SymbolTickerData;
}

// Helper to map exchange names to colors (approximate from screenshot)
const EXCHANGE_COLORS: Record<string, string> = {
    binance: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
    coinbase: 'bg-green-500/20 text-green-500 border-green-500/20',
    kucoin: 'bg-teal-500/20 text-teal-500 border-teal-500/20',
    kraken: 'bg-blue-500/20 text-blue-500 border-blue-500/20',
};

export function ArbitrageCard({ symbol, data }: ArbitrageCardProps) {
    const { prices, arbitrage } = data;
    const { bestRoute } = arbitrage;

    // If we have a calculated route, use those exchanges. 
    // Otherwise just pick top 2 or available ones for display?
    // The screenshot shows "coinbase" and "kucoin" explicitly.
    // Let's try to show the ones involved in the best route if available, 
    // otherwise just list available prices.
    
    const exchanges = Object.keys(prices) as Exchange[];
    const displayExchanges = bestRoute 
        ? [bestRoute.buyExchange, bestRoute.sellExchange] 
        : exchanges.slice(0, 2);

    const spreadPct = bestRoute ? bestRoute.spreadPercentage : 0;
    const spreadValue = bestRoute ? bestRoute.spread : 0;
    const profitPct = bestRoute ? bestRoute.profitPercentage : 0;
    const profitValue = bestRoute ? bestRoute.profit : 0;

    const isProfitPositive = profitValue > 0;

    // Extract base symbol for display (SOL_USDT -> SOL)
    const baseSymbol = symbol.split('_')[0];

    return (
        <div className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow w-full max-w-sm relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    {/* Placeholder Icon */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {baseSymbol[0]}
                    </div>
                    <span className="font-bold text-lg">{baseSymbol}</span>
                </div>
                
                <div className="text-right">
                    <div className={cn("text-sm font-medium", spreadPct >= 0 ? "text-green-500" : "text-red-500")}>
                        Difference : {spreadPct > 0 ? '+' : ''}{Math.abs(spreadPct).toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {spreadValue > 0 ? '+' : ''}${Math.abs(spreadValue).toFixed(6)}
                    </div>
                </div>
            </div>

            {/* Prices Route */}
            <div className="flex items-center justify-between mb-6">
                {/* Buy Side */}
                <div className="flex flex-col gap-1">
                    {displayExchanges[0] && (
                        <>
                            <div className={cn("px-2 py-0.5 rounded text-xs font-medium border w-fit capitalize", EXCHANGE_COLORS[displayExchanges[0]] || 'bg-gray-500/20 text-gray-400')}>
                                {displayExchanges[0]}
                            </div>
                            <span className="font-mono font-semibold">
                                ${prices[displayExchanges[0]]?.bestAsk?.toFixed(4) || '---'}
                            </span>
                        </>
                    )}
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-muted-foreground/50" />

                {/* Sell Side */}
                <div className="flex flex-col gap-1 items-end">
                    {displayExchanges[1] && (
                        <>
                            <div className={cn("px-2 py-0.5 rounded text-xs font-medium border w-fit capitalize", EXCHANGE_COLORS[displayExchanges[1]] || 'bg-gray-500/20 text-gray-400')}>
                                {displayExchanges[1]}
                            </div>
                            <span className="font-mono font-semibold">
                                ${prices[displayExchanges[1]]?.bestBid?.toFixed(4) || '---'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Status & Profit */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status: <span className="text-foreground font-medium">OPEN</span></span>
                    <span className="text-xs text-muted-foreground">Live prices</span>
                </div>
                
                <div className={cn("font-medium text-lg", isProfitPositive ? "text-green-500" : "text-red-500")}>
                    After Fees: {profitValue.toFixed(5)} ({profitPct.toFixed(2)}%)
                </div>

                {bestRoute && (
                    <SpreadPct
                        symbol={symbol}
                        buyExchange={bestRoute.buyExchange}
                        sellExchange={bestRoute.sellExchange}
                    />
                )}
            </div>
        </div>
    );
}
