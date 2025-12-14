import type { Exchange } from './types';
import { client } from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

interface SpreadPctProps {
  symbol: string;
  buyExchange: Exchange;
  sellExchange: Exchange;
}

export function SpreadPct({ symbol, buyExchange, sellExchange }: SpreadPctProps) {
  const { data } = useQuery({
    queryKey: ['spread-history', symbol, buyExchange, sellExchange],
    queryFn: async () => {
      const exchanges = [buyExchange, sellExchange];
      const res = await (client as any)['spread-history'].summary.get({
        query: {
          symbol,
          exchanges: exchanges.join(','),
        },
      });
      return res.data as any;
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  const summary = data?.ok ? data.summary : null;
  const max1h = summary?.last1h.maxSpreadPercentage ?? null;
  const max24h = summary?.last24h.maxSpreadPercentage ?? null;

  return (
    <div className="text-sm font-medium text-muted-foreground space-y-1">
      <div>
        1h Max Spread: {max1h != null ? `${max1h > 0 ? '+' : ''}${max1h.toFixed(2)}%` : '--'}
      </div>
      <div>
        24h Max Spread: {max24h != null ? `${max24h > 0 ? '+' : ''}${max24h.toFixed(2)}%` : '--'}
      </div>
    </div>
  );
}
