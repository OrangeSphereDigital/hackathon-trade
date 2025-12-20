interface SimulatedTradesSummaryProps {
  totalTrades: number;
  totalProfit: number;
}

export function SimulatedTradesSummary({ totalTrades, totalProfit }: SimulatedTradesSummaryProps) {
  const profitClass = totalProfit >= 0 ? "text-green-500" : "text-red-500";

  return (
    <div className="mb-2 text-sm font-medium">
      Total profit for {totalTrades} trades:{" "}
      <span className={profitClass}>
        {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(4)}
      </span>
    </div>
  );
}
