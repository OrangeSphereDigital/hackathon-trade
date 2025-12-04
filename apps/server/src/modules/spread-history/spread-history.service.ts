import type { Exchange } from '../ticker/type';
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

    const { max1h, max24h } = await getMaxSpreadRecords({
      symbol,
      buyExchange,
      sellExchange,
    });

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
}

export const spreadHistoryService = new SpreadHistoryService();
