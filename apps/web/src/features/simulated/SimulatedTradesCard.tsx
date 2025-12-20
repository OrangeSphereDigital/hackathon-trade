import { useQuery } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { client } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCcw } from "lucide-react";

type ArbitrageItem = {
	id: string;
	symbol: string;
	buyExchange: string;
	sellExchange: string;
	buyPrice: number;
	sellPrice: number;
	profit: number;
	createdAt: string;
};

export type SimulatedTradeItem = {
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
	const now = new Date();
	const today = now.toISOString().slice(0, 10);
	const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const yesterday = yesterdayDate.toISOString().slice(0, 10);

	const form = useForm({
		defaultValues: {
			page: 1,
			// Default to last 24 hours
			dateFrom: yesterday,
			dateTo: today,
		},
		onSubmit: () => {
			// No-op: we react to value changes directly via query key
		},
	});

	const values = useStore(form.store, (state) => state.values);

	const {
		data,
		isLoading: loading,
		isRefetching,
		refetch,
	} = useQuery({
		queryKey: [
			"simulated-trades",
			limit,
			values.page,
			values.dateFrom,
			values.dateTo,
		],
		queryFn: async () => {
			const query: Record<string, any> = {
				limit,
				page: values.page,
			};

			if (values.dateFrom) {
				query.dateFrom = values.dateFrom;
			}
			if (values.dateTo) {
				query.dateTo = values.dateTo;
			}

			const { data } = await client.arbitrage.index.get({
				query,
			});
			return {
				items: (data?.items as ArbitrageItem[]) ?? [],
				total: data?.total ?? 0,
			};
		},
	});

	const opportunities = (data?.items as ArbitrageItem[]) ?? [];
	const SIMULATION_TRADE_AMOUNT_USD = 1000;

	const simTrades: SimulatedTradeItem[] = opportunities.map((o) => {
		const amountUsd = SIMULATION_TRADE_AMOUNT_USD;
		const amountBase = o.buyPrice > 0 ? amountUsd / o.buyPrice : 0;
		// o.profit is net profit per 1 base unit, so scale by amountBase
		const estimatedProfit = o.profit * amountBase;

		return {
			id: o.id,
			opportunityId: o.id,
			symbol: o.symbol,
			buyExchange: o.buyExchange,
			sellExchange: o.sellExchange,
			buyPrice: o.buyPrice,
			sellPrice: o.sellPrice,
			amountUsd,
			estimatedProfit,
			createdAt: o.createdAt,
		};
	});
	const total = data?.total ?? 0;
	const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

	const canGoPrev = values.page > 1;
	const canGoNext = values.page < totalPages;

	

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
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="mb-4 grid gap-4 md:grid-cols-4 md:items-end"
				>
					<div className="space-y-1 md:col-span-1">
						<Label htmlFor="dateFrom">From</Label>
						<form.Field name="dateFrom">
							{(field) => (
								<Input
									id={field.name}
									type="date"
									value={field.state.value ?? ""}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							)}
						</form.Field>
					</div>
					<div className="space-y-1 md:col-span-1">
						<Label htmlFor="dateTo">To</Label>
						<form.Field name="dateTo">
							{(field) => (
								<Input
									id={field.name}
									type="date"
									value={field.state.value ?? ""}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							)}
						</form.Field>
					</div>
					<div className="flex items-center gap-2 md:col-span-2 md:justify-end">
						<Button
							variant="outline"
							type="button"
							size="sm"
							onClick={() => {
								form.setFieldValue("page", Math.max(1, values.page - 1));
							}}
							disabled={!canGoPrev}
						>
							Prev
						</Button>
						<span className="text-xs text-muted-foreground">
							Page {values.page} of {totalPages}
						</span>
						<Button
							variant="outline"
							type="button"
							size="sm"
							onClick={() => {
								form.setFieldValue("page", canGoNext ? values.page + 1 : values.page);
							}}
							disabled={!canGoNext}
						>
							Next
						</Button>
					</div>
				</form>
				{loading ? (
					<div className="text-muted-foreground">Loading...</div>
				) : simTrades.length === 0 ? (
					<div className="text-muted-foreground">No simulated trades yet.</div>
				) : (
					<div className="space-y-3">
						{simTrades?.map((t) => (
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
