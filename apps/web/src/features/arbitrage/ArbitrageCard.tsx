import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ArbitrageItem } from "./type"

export function ArbitrageCard({ item }: { item: ArbitrageItem }) {

    return (
        <Card className="w-full">
            <CardHeader className="pb-2 cursor-pointer" >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <CardTitle className="text-lg">{item.symbol}</CardTitle>
                        <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'ON_CHAIN' ? 'bg-green-100 text-green-800' :
                            item.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                item.status === 'DETECTED' ? 'bg-blue-100 text-blue-800' :
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

        </Card>
    );
}