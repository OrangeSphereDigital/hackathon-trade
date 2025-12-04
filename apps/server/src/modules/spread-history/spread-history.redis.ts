import { redis } from '@/lib/redis';
import type { SpreadSample } from './spread-history.types';

// We only keep two aggregate records per (buyExchange, sellExchange, symbol):
// - max spread% over last 1h
// - max spread% over last 24h

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export type MaxSpreadRecord = { p: number; t: number };

function baseKey(sample: { buyExchange: string; sellExchange: string; symbol: string }) {
  // Example: spread-history:max1h:binance-kucoin:BTC_USDT
  const pair = `${sample.buyExchange}-${sample.sellExchange}`;
  return { pair };
}

function keyMax1h(sample: { buyExchange: string; sellExchange: string; symbol: string }) {
  const { pair } = baseKey(sample);
  return `spread-history:max1h:${pair}:${sample.symbol}`;
}

function keyMax24h(sample: { buyExchange: string; sellExchange: string; symbol: string }) {
  const { pair } = baseKey(sample);
  return `spread-history:max24h:${pair}:${sample.symbol}`;
}

export async function recordSpreadSample(sample: SpreadSample): Promise<void> {
  if (!Number.isFinite(sample.spreadPercentage)) return;

  const ts = sample.ts ?? Date.now();
  const payload: MaxSpreadRecord = { p: sample.spreadPercentage, t: ts };

  const { buyExchange, sellExchange, symbol } = sample;

  // 1h max spread
  const k1h = keyMax1h({ buyExchange, sellExchange, symbol });
  const cur1h = await redis.get<MaxSpreadRecord | null>(k1h);
  const shouldReplace1h = !cur1h || ts - cur1h.t > HOUR_MS || sample.spreadPercentage > cur1h.p;
  if (shouldReplace1h) {
    await redis.set(k1h, payload, Math.ceil(HOUR_MS / 1000));
  }

  // 24h max spread
  const k24 = keyMax24h({ buyExchange, sellExchange, symbol });
  const cur24 = await redis.get<MaxSpreadRecord | null>(k24);
  const shouldReplace24 = !cur24 || ts - cur24.t > DAY_MS || sample.spreadPercentage > cur24.p;
  if (shouldReplace24) {
    await redis.set(k24, payload, Math.ceil(DAY_MS / 1000));
  }
}

export async function getMaxSpreadRecords(params: {
  buyExchange: string;
  sellExchange: string;
  symbol: string;
}): Promise<{ max1h: MaxSpreadRecord | null; max24h: MaxSpreadRecord | null }> {
  const { buyExchange, sellExchange, symbol } = params;

  const [max1h, max24h] = await Promise.all([
    redis.get<MaxSpreadRecord | null>(keyMax1h({ buyExchange, sellExchange, symbol })),
    redis.get<MaxSpreadRecord | null>(keyMax24h({ buyExchange, sellExchange, symbol })),
  ]);

  return { max1h: max1h ?? null, max24h: max24h ?? null };
}
