import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

type SimulatedTradeItem = {
	id: string;
	opportunityId: string;
	symbol: string;
	buyExchange: string;
	sellExchange: string;
	buyPrice: number;
	sellPrice: number;
	amountUsd: number;
	estimatedProfit: number;
	createdAt: string;
};

interface SimulatedTradesCardProps {
	limit?: number;
	pollIntervalMs?: number;
}

export function SimulatedTradesCard({
	limit = 10,
}: SimulatedTradesCardProps) {
	const { data: simTrades = [], isLoading: loading, refetch, isRefetching } = useQuery({
		queryKey: ["simulated-trades", limit],
		queryFn: async () => {
			const { data } = await client.simulation.index.get({
				query: { limit },
			});
			return (data?.items as SimulatedTradeItem[]) ?? [];
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span>Simulation</span>
						<Badge variant="secondary">Simulated Trades</Badge>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => refetch()}
						disabled={isRefetching}
					>
						<RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="text-muted-foreground">Loading...</div>
				) : simTrades.length === 0 ? (
					<div className="text-muted-foreground">No simulated trades yet.</div>
				) : (
					<div className="space-y-3">
						{simTrades.map((t) => (
							<div
								key={t.id}
								className="flex flex-col gap-1 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
							>
								<div>
									<div className="font-semibold">{t.symbol}</div>
									<div className="text-sm text-muted-foreground">
										{t.buyExchange} → {t.sellExchange}
									</div>
									<div className="text-xs text-muted-foreground">
										${t.amountUsd.toFixed(2)} • {new Date(t.createdAt).toLocaleString()}
									</div>
								</div>
								<div className="text-right">
									<div
										className={
											t.estimatedProfit >= 0
												? "font-bold text-green-500"
												: "font-bold text-red-500"
										}
									>
										{t.estimatedProfit >= 0 ? "+" : ""}${t.estimatedProfit.toFixed(4)}
									</div>
									<div className="text-xs text-muted-foreground">
										Buy ${t.buyPrice.toFixed(4)} • Sell ${t.sellPrice.toFixed(4)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
