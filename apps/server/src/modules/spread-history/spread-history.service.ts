import type { Exchange } from '../ticker/type';
import { tickerRedis } from '../ticker/ticker.redis.service';
import { getMaxSpreadRecords, recordSpreadSample } from './spread-history.redis';
import type { SpreadHistorySummary, SpreadSample } from './spread-history.types';

export class SpreadHistoryService {
  async addSample(sample: SpreadSample): Promise<void> {
    await recordSpreadSample(sample);
  }

  async getSummary(params: {
    symbol: string;
    buyExchange: Exchange;
    sellExchange: Exchange;
  }): Promise<SpreadHistorySummary> {
    const { symbol, buyExchange, sellExchange } = params;

    let { max1h, max24h } = await getMaxSpreadRecords({
      symbol,
      buyExchange,
      sellExchange,
    });

    // If we don't have any history yet, seed it from current live spread
    if (!max1h || !max24h) {
      const internalSymbol = symbol.replace(/_/g, '').toUpperCase();

      try {
        const [buyTick, sellTick] = await Promise.all([
          tickerRedis.getLatest(buyExchange, internalSymbol),
          tickerRedis.getLatest(sellExchange, internalSymbol),
        ]);

        if (buyTick?.bestAsk && sellTick?.bestBid) {
          const buyPrice = buyTick.bestAsk;
          const sellPrice = sellTick.bestBid;
          const spread = sellPrice - buyPrice;
          const spreadPercentage = (spread / buyPrice) * 100;

          if (Number.isFinite(spreadPercentage)) {
            const ts = Date.now();
            await recordSpreadSample({
              symbol,
              buyExchange,
              sellExchange,
              spreadPercentage,
              ts,
            });

            // Re-read so response is consistent with Redis state
            const seeded = await getMaxSpreadRecords({
              symbol,
              buyExchange,
              sellExchange,
            });
            max1h = seeded.max1h;
            max24h = seeded.max24h;
          }
        }
      } catch (e) {
        console.warn('[SpreadHistoryService] Failed to seed from live ticker', e);
      }
    }

    return {
      symbol,
      buyExchange,
      sellExchange,
      last1h: {
        maxSpreadPercentage: max1h?.p ?? null,
        maxTs: max1h?.t ?? null,
      },
      last24h: {
        maxSpreadPercentage: max24h?.p ?? null,
        maxTs: max24h?.t ?? null,
      },
    };
  }

  async getSummaryForExchanges(params: {
    symbol: string;
    exchanges: Exchange[];
  }): Promise<SpreadHistorySummary> {
    const { symbol } = params;
    const exchanges = params.exchanges.map((e) => e.toLowerCase() as Exchange);

    const internalSymbol = symbol.replace(/_/g, '').toUpperCase();

    const ticks = await Promise.all(
      exchanges.map(async (exchange) => {
        const tick = await tickerRedis.getLatest(exchange, internalSymbol);
        return { exchange, tick } as const;
      }),
    );

    const valid = ticks.filter((entry) => entry.tick?.bestAsk && entry.tick?.bestBid);

    if (valid.length < 2) {
      throw new Error('Not enough valid ticks to compute spread across exchanges');
    }

    const buyCandidate = valid.reduce((min, cur) => {
      const curAsk = cur.tick!.bestAsk;
      const minAsk = min.tick!.bestAsk;
      return curAsk < minAsk ? cur : min;
    });

    const sellCandidate = valid.reduce((max, cur) => {
      const curBid = cur.tick!.bestBid;
      const maxBid = max.tick!.bestBid;
      return curBid > maxBid ? cur : max;
    });

    const buyExchange = buyCandidate.exchange;
    const sellExchange = sellCandidate.exchange;

    return this.getSummary({
      symbol,
      buyExchange,
      sellExchange,
    });
  }
}

export const spreadHistoryService = new SpreadHistoryService();
