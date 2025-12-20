interface SimulatedTradesSummaryProps {
  totalTrades: number;
  totalProfit: number;
}

export function SimulatedTradesSummary({ totalTrades, totalProfit }: SimulatedTradesSummaryProps) {
  const profitClass = totalProfit >= 0 ? "text-green-500" : "text-red-500";

  return (
    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <div className="text-sm font-semibold uppercase tracking-wide text-foreground">
        Simulated total profit
        <span className="ml-1 text-[11px] font-normal lowercase text-muted-foreground/80">
          ({totalTrades} trades)
        </span>
      </div>
      <div className={`font-mono text-xl font-semibold sm:text-2xl md:text-3xl ${profitClass}`}>
        {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(4)}
      </div>
    </div>
  );
}
