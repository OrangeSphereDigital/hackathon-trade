import type { SimulatedTradeItem } from "./SimulatedTradesCard";

interface SimulatedTradeRowProps {
  trade: SimulatedTradeItem;
}

function getSymbolColor(symbol: string): string {
  switch (symbol.toUpperCase()) {
    case "BTCUSDT":
      return "bg-amber-500/20 text-amber-300";
    case "ETHUSDT":
      return "bg-indigo-500/20 text-indigo-300";
    case "SOLUSDT":
      return "bg-cyan-500/20 text-cyan-300";
    case "BNBUSDT":
      return "bg-emerald-500/20 text-emerald-300";
    default:
      return "bg-muted text-foreground";
  }
}

export function SimulatedTradeRow({ trade }: SimulatedTradeRowProps) {
  const dateStr = new Date(trade.createdAt).toLocaleString();
  const profitClass = trade.estimatedProfit >= 0 ? "text-green-500" : "text-red-500";
  const spreadPercent =
    trade.sellPrice > 0
      ? ((trade.sellPrice - trade.buyPrice) / trade.buyPrice) * 100
      : 0;

  return (
    <div className="rounded-md border bg-card/40 px-3 py-2 text-xs md:text-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="space-y-0.5">
          <div className="font-mono text-[11px] md:text-xs text-muted-foreground">
            {dateStr}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${getSymbolColor(
                trade.symbol,
              )}`}
            >
              {trade.symbol}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Amount: ${trade.amountUsd.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Profit
          </div>
          <div className={`text-base font-semibold hidden sm:block md:text-lg ${profitClass}`}>
            {trade.estimatedProfit >= 0 ? "+" : ""}${trade.estimatedProfit.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="mt-2 grid gap-2 text-[11px] text-muted-foreground grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-emerald-400">Buy</div>
          <div className="font-mono text-xs text-emerald-100">
            {trade.buyExchange} @ ${trade.buyPrice.toFixed(4)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-red-400">Sell</div>
          <div className="font-mono text-xs text-red-100">
            {trade.sellExchange} @ ${trade.sellPrice.toFixed(4)}
          </div>
        </div>
        <div className="md:text-right">
          <div className="text-[10px] uppercase tracking-wide text-amber-400">Spread</div>
          <div className="font-mono text-sm font-semibold text-amber-200">
            {spreadPercent.toFixed(3)}%
          </div>
        </div>
      </div>
    </div>
  );
}
