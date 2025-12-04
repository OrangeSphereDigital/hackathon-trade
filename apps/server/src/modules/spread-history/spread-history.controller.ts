import { Elysia, t } from 'elysia';
import type { Exchange } from '../ticker/type';
import { spreadHistoryService } from './spread-history.service';

export const spreadHistoryController = new Elysia({ prefix: '/spread-history' })
  .get(
    '/:buyExchange/:sellExchange/:symbol/summary',
    async ({ params, set }) => {
      try {
        const buyExchange = params.buyExchange.toLowerCase() as Exchange;
        const sellExchange = params.sellExchange.toLowerCase() as Exchange;
        const symbol = params.symbol.toUpperCase();

        const summary = await spreadHistoryService.getSummary({
          symbol,
          buyExchange,
          sellExchange,
        });

        return { ok: true, summary };
      } catch (error: any) {
        set.status = 500;
        return { ok: false, error: error.message };
      }
    },
    {
      params: t.Object({
        buyExchange: t.String(),
        sellExchange: t.String(),
        symbol: t.String(),
      }),
      detail: {
        summary: 'Spread history summary (max spread%)',
        description:
          'Returns last 1h and 24h max spread percentage for a given exchange pair and symbol.',
        tags: ['Spread History'],
      },
    },
  );
