import { useState, useMemo } from 'react';
import { useTickerWebSocket } from './useTickerWebSocket';
import { ArbitrageCard } from './ArbitrageCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { AVAILABLE_EXCHANGES, AVAILABLE_SYMBOLS } from '@/constants/options';

interface LiveTickerProps {
    initialSymbols?: string[];
    initialExchanges?: string[];
}

const DEFAULT_SYMBOLS = ['SOL_USDT', 'ETH_USDT', 'BTC_USDT', 'BNB_USDT'];
const DEFAULT_EXCHANGES = ['binance', 'kucoin'];

export function LiveTicker({
    initialSymbols = DEFAULT_SYMBOLS,
    initialExchanges = DEFAULT_EXCHANGES
}: LiveTickerProps) {
    // State for the inputs (now arrays)
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>(initialSymbols);
    const [selectedExchanges, setSelectedExchanges] = useState<string[]>(initialExchanges);

    // State for the active configuration (passed to the hook)
    const [activeConfig, setActiveConfig] = useState({
        symbols: initialSymbols,
        exchanges: initialExchanges
    });

    const handleApply = () => {
        setActiveConfig({
            symbols: selectedSymbols.length > 0 ? selectedSymbols : DEFAULT_SYMBOLS,
            exchanges: selectedExchanges.length > 0 ? selectedExchanges : DEFAULT_EXCHANGES
        });
    };

    const { data, status } = useTickerWebSocket({
        symbols: activeConfig.symbols,
        exchanges: activeConfig.exchanges
    });

    const sortedSymbols = useMemo(() => {
        return Object.keys(data)
            .filter(symbol => activeConfig.symbols.includes(symbol))
            .sort();
    }, [data, activeConfig.symbols]);

    return (
        <div className="space-y-6" id='monitor'>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Live Arbitrage Monitor</h2>
                <div className="flex items-center gap-2 text-xs">
                    <span className={`flex h-2 w-2 rounded-full animate-pulse ${status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-muted-foreground uppercase">{status === 'connected' ? 'Live' : status}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="grid gap-4 p-4 border rounded-lg bg-card md:grid-cols-[1fr_1fr_auto] items-end">
                <div className="space-y-2">
                    <Label>Exchanges</Label>
                    <MultiSelect
                        options={AVAILABLE_EXCHANGES}
                        selected={selectedExchanges}
                        onChange={setSelectedExchanges}
                        placeholder="Select exchanges..."
                        label="Available Exchanges"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Pairs</Label>
                    <MultiSelect
                        options={AVAILABLE_SYMBOLS}
                        selected={selectedSymbols}
                        onChange={setSelectedSymbols}
                        placeholder="Select pairs..."
                        label="Available Pairs"
                    />
                </div>
                <Button onClick={handleApply} className="mb-0.5">
                    Apply Configuration
                </Button>
            </div>

            {/* Content */}
            {status === 'connecting' && Object.keys(data).length === 0 ? (
                <div className="p-12 text-center text-muted-foreground animate-pulse">
                    Connecting to feed...
                </div>
            ) : status === 'error' ? (
                <div className="p-12 text-center text-destructive">
                    Connection error. Please check your configuration or server status.
                </div>
            ) : (
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
                            Waiting for updates for: {activeConfig.symbols.join(', ')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
