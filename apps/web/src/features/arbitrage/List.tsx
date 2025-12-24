import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import type { ArbitrageItem } from "./type";
import { ArbitrageCard } from "./ArbitrageCard";
import { Button } from "@/components/ui/button";
import { DatePicker } from "../../components/ui/DatePicker";

export const ArbitrageList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [from, setFrom] = useState<string>(
    new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toDateString()
  );
  console.log(from)
  const [to, setTo] = useState<string>("");

  const { data, isLoading, isRefetching, refetch } = useQuery<{
    items: ArbitrageItem[];
    total: number;
  } | null>({
    queryKey: ["arbitrage-history", { page, limit, from, to }],
    queryFn: async () => {
      const query: Record<string, unknown> = { page, limit };
      if (from) query.dateFrom = from;
      if (to) query.dateTo = to;

      const { data } = await client.arbitrage.index.get({
        query,
      });

      return (data as { items: ArbitrageItem[]; total: number } | null) ?? null;
    },
  });

  const items: ArbitrageItem[] = data?.items ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">
            From
          </label>
          <DatePicker
            value={from || undefined}
            onChange={(val) => {
              setPage(1);
              setFrom(val);
            }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">
            To
          </label>
          <DatePicker
            value={to || undefined}
            onChange={(val) => {
              setPage(1);
              setTo(val);
            }}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {isLoading && !data ? (
          <div>Loading...</div>
        ) : items.length === 0 ? (
          <div>No records found.</div>
        ) : (
          items.map((item: ArbitrageItem) => (
            <ArbitrageCard key={item.id} item={item} />
          ))
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
