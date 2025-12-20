import type { SimulatedTradeItem } from "./SimulatedTradesCard";

interface SimulatedTradeRowProps {
  trade: SimulatedTradeItem;
}

export function SimulatedTradeRow({ trade }: SimulatedTradeRowProps) {
  const dateStr = new Date(trade.createdAt).toLocaleString();
  const profitClass = trade.estimatedProfit >= 0 ? "text-green-500" : "text-red-500";

  return (
    <div className="rounded-md border px-3 py-2 text-xs md:text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-[11px] md:text-xs text-muted-foreground">{dateStr}</div>
        <div className={`font-semibold ${profitClass}`}>
          {trade.estimatedProfit >= 0 ? "+" : ""}${trade.estimatedProfit.toFixed(4)}
        </div>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1 text-muted-foreground">
        <span className="font-semibold text-foreground">{trade.symbol}</span>
        <span>|</span>
        <span>
          Buy {trade.buyExchange} @ ${trade.buyPrice.toFixed(4)}
        </span>
        <span>→</span>
        <span>
          Sell {trade.sellExchange} @ ${trade.sellPrice.toFixed(4)}
        </span>
        <span>|</span>
        <span>Amount ${trade.amountUsd.toFixed(2)}</span>
      </div>
    </div>
  );
}
