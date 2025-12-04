import { Elysia, t } from 'elysia';
import type { Exchange } from '../ticker/type';
import { spreadHistoryService } from './spread-history.service';

export const spreadHistoryController = new Elysia({ prefix: '/spread-history' })
  .get(
    '/summary',
    async ({ query, set }) => {
      try {
        const symbol = query.symbol.toUpperCase();
        const exchangesRaw = query.exchanges
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean);

        const exchanges = exchangesRaw.map((e) => e.toLowerCase() as Exchange);

        if (exchanges.length < 2) {
          set.status = 400;
          return { ok: false, error: 'At least two exchanges are required' };
        }

        const summary = await spreadHistoryService.getSummaryForExchanges({
          symbol,
          exchanges,
        });

        return { ok: true, summary };
      } catch (error: any) {
        set.status = 500;
        return { ok: false, error: error.message };
      }
    },
    {
      query: t.Object({
        symbol: t.String(),
        exchanges: t.String(), // comma-separated list of exchanges
      }),
      detail: {
        summary: 'Spread history summary (max spread%)',
        description:
          'Returns last 1h and 24h max spread percentage for the best buy/sell pair derived from the provided exchanges for a symbol.',
        tags: ['Spread History'],
      },
    },
  );
