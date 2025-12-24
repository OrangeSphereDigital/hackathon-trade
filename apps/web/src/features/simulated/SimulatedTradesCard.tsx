import { useQuery } from "@tanstack/react-query";
import { useForm, useStore } from "@tanstack/react-form";
import { client } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { SimulatedTradesSummary } from "./SimulatedTradesSummary";
import { SimulatedTradeRow } from "./SimulatedTradeRow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "../../components/ui/DatePicker";

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
	const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	const start = startDate.toISOString().slice(0, 10);

	const form = useForm({
		defaultValues: {
			page: 1,
			// Default to last 24 hours
			dateFrom: start,
			dateTo: today,
			// Daily trade amount in USD
			dailyAmount: 1000,
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
	const DAILY_TRADES_COUNT = 10;
	const dailyAmount = Number(values.dailyAmount) || 1000;
	const amountPerTrade = dailyAmount * 0.1; // 10% per trade

	const simTrades: SimulatedTradeItem[] = opportunities
		.slice(0, DAILY_TRADES_COUNT)
		.map((o) => {
			const amountUsd = amountPerTrade;
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

	const totalProfit = simTrades.reduce((sum, t) => sum + t.estimatedProfit, 0);
	const total = data?.total ?? 0;
	const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

	const canGoPrev = values.page > 1;
	const canGoNext = values.page < totalPages;



	return (
		<Card className="overflow-hidden">
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
					className="mb-4 grid gap-4 md:grid-cols-5 md:items-end"
				>
					<div className="space-y-1 md:col-span-1">
						<Label htmlFor="dateFrom">From</Label>
						<form.Field name="dateFrom">
							{(field) => (
								<DatePicker
									value={field.state.value}
									onChange={(val) => field.handleChange(val)}
								/>
							)}
						</form.Field>
					</div>
					<div className="space-y-1 md:col-span-1">
						<Label htmlFor="dateTo">To</Label>
						<form.Field name="dateTo">
							{(field) => (
								<DatePicker
									value={field.state.value}
									onChange={(val) => field.handleChange(val)}
								/>
							)}
						</form.Field>
					</div>
					<div className="space-y-1 md:col-span-1">
						<Label htmlFor="dailyAmount">Daily amount (USD)</Label>
						<form.Field name="dailyAmount">
							{(field) => (
								<Select
									value={String(field.state.value ?? 1000)}
									onValueChange={(val) => field.handleChange(Number(val))}
								>
									<SelectTrigger className="h-10 w-full justify-between text-left font-normal">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="100">$100</SelectItem>
										<SelectItem value="1000">$1,000</SelectItem>
										<SelectItem value="10000">$10,000</SelectItem>
										<SelectItem value="50000">$50,000</SelectItem>
										<SelectItem value="100000">$100,000</SelectItem>
									</SelectContent>
								</Select>
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
				<SimulatedTradesSummary totalTrades={simTrades.length} totalProfit={totalProfit} />
				{loading ? (
					<div className="text-muted-foreground">Loading...</div>
				) : simTrades.length === 0 ? (
					<div className="text-muted-foreground">No simulated trades yet.</div>
				) : (
					<div className="space-y-2">
						{simTrades?.map((t) => (
							<SimulatedTradeRow key={t.id} trade={t} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
