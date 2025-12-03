import { createFileRoute, redirect } from "@tanstack/react-router";
import { client } from "@/lib/client";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/arbitrage")({
    component: ArbitragePage,
    beforeLoad: async () => {
        const session = await authClient.getSession();
        if (!session.data) {
            redirect({
                to: "/login",
                throw: true,
            });
        }
        return { session };
    },
});

type ArbitrageItem = {
    id: string;
    symbol: string;
    buyExchange: string;
    sellExchange: string;
    buyPrice: number;
    sellPrice: number;
    profit: number;
    status: string;
    txHash: string | null;
    createdAt: string;
    error: string | null;
};

function ArbitragePage() {
    const [items, setItems] = useState<ArbitrageItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data, error } = await client.arbitrage.index.get({
                    query: { limit: 50 }
                });
                if (data) {
                    setItems(data.items as any); // Type casting might be needed if client types aren't perfectly synced yet
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Arbitrage History</h1>
                <p className="text-muted-foreground">
                    On-chain execution records from BNB Testnet.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                {loading ? (
                    <div>Loading...</div>
                ) : items.length === 0 ? (
                    <div>No records found.</div>
                ) : (
                    items.map((item) => (
                        <ArbitrageCard key={item.id} item={item} />
                    ))
                )}
            </div>
        </div>
    );
}

function ArbitrageCard({ item }: { item: ArbitrageItem }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="w-full">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <CardTitle className="text-lg">{item.symbol}</CardTitle>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            item.status === 'ON_CHAIN' ? 'bg-green-100 text-green-800' :
                            item.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {item.status}
                        </span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                            +${item.profit.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>
            </CardHeader>
            {expanded && (
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                        <div>
                            <div className="text-muted-foreground">Buy</div>
                            <div>{item.buyExchange} @ ${item.buyPrice.toFixed(4)}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Sell</div>
                            <div>{item.sellExchange} @ ${item.sellPrice.toFixed(4)}</div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-muted-foreground">Transaction Hash</div>
                            {item.txHash ? (
                                <a 
                                    href={`https://testnet.bscscan.com/tx/${item.txHash}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-blue-500 hover:underline break-all font-mono"
                                >
                                    {item.txHash}
                                </a>
                            ) : (
                                <span className="text-muted-foreground italic">Not available</span>
                            )}
                        </div>
                        {item.error && (
                            <div className="col-span-2 text-red-500">
                                <div className="font-medium">Error</div>
                                <div className="break-all">{item.error}</div>
                            </div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
