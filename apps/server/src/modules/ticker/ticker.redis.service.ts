import type { Exchange, TickerData } from './type';
import { redis } from '@/lib/redis';
import { SubscriptionManager } from './ticker.subscription-manager.service';
import { env } from '@/constants/env';

// Default Time-To-Live for ticker data in Redis (seconds)
// Reduced to 30s to prevent stale data accumulation
const DEFAULT_TTL_SEC = Number(env.TICKER_REDIS_TTL_SEC ?? 30);

/**
 * Generates the Redis key for the latest candle of a specific exchange/symbol pair.
 * Format: ticker:last:<exchange>:<symbol>
 */
function getRedisKey(exchange: Exchange, symbol: string) {
  return `ticker:last:${exchange}:${symbol}`;
}

/**
 * Generates the Redis Pub/Sub channel name for live updates.
 * Format: ticker:pub:<exchange>:<symbol>
 */
function getPubSubChannel(exchange: Exchange, symbol: string) {
  return `ticker:pub:${exchange}:${symbol}`;
}

/**
 * Checks if a candle's timestamp is within the acceptable age limit.
 */
function isCandleFresh(candleTimeSec: number, maxAgeSec: number): boolean {
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec - candleTimeSec <= maxAgeSec;
}

/**
 * Stores the latest candle in Redis and publishes it to subscribers.
 * This handles both "real" ticks and "synthetic" (gap-filling) ticks.
 */
async function setLatest(exchange: Exchange, symbol: string, candle: TickerData, ttlSec: number = DEFAULT_TTL_SEC): Promise<void> {
  const client = await redis.getClient();
  const key = getRedisKey(exchange, symbol);

  // 1. Store the candle in Redis (KV store) for initial page loads / polling
  await client.set(key, JSON.stringify(candle), { EX: ttlSec });

  try {
    // 2. Publish the candle to the live channel for WebSocket subscribers
    const channel = getPubSubChannel(exchange, symbol);
    await client.publish(channel, JSON.stringify(candle));
  } catch (error) {
    // If publishing fails, we log it but don't crash. The KV update succeeded.
    console.warn('[tickerRedis] Failed to publish candle update:', error);
  }
}

/**
 * Retrieves the single latest candle for a specific exchange/symbol from Redis.
 */
async function getLatest(exchange: Exchange, symbol: string): Promise<TickerData | null> {
  const client = await redis.getClient();
  const key = getRedisKey(exchange, symbol);
  
  const rawData = await client.get(key);
  if (!rawData) return null;

  try {
    const candle = JSON.parse(rawData) as TickerData;
    // Basic validation to ensure we have a valid candle object
    if (typeof candle?.time !== 'number') return null;
    return candle;
  } catch {
    return null;
  }
}

/**
 * Retrieves the latest candles for a given symbol across multiple exchanges.
 * Only returns "fresh" candles (within maxAgeSec).
 */
async function getExchangesLatest(
  symbol: string, 
  exchanges: Exchange[], 
  maxAgeSec: number = 15
): Promise<Partial<Record<Exchange, TickerData | null>>> {
  // Fetch all exchange data in parallel
  const candlePromises = exchanges.map((exchange) => getLatest(exchange, symbol));
  const results = await Promise.all(candlePromises);
  
  const output: Partial<Record<Exchange, TickerData | null>> = {};
  
  exchanges.forEach((exchange, index) => {
    const candle = results[index];
    // Only include the candle if it exists and is recent enough
    output[exchange] = candle && isCandleFresh(candle.time, maxAgeSec) ? candle : null;
  });
  
  return output;
}

const subManager = SubscriptionManager.getInstance();

/**
 * Subscribes to live candle updates for a symbol across multiple exchanges.
 * Uses a shared Redis connection to multiplex subscriptions.
 */
async function subscribeExchangesLatest(
  symbol: string, 
  exchanges: Exchange[], 
  onCandle: (exchange: Exchange, candle: TickerData) => void
) {
  // console.log({env})
  // Create subscriptions for each exchange
  const unsubs = await Promise.all(
    exchanges.map(exchange => 
      subManager.subscribe(exchange, symbol, onCandle)
    )
  );

  // Return a single close function that unsubscribes from all
  return {
    close: () => {
      unsubs.forEach(unsub => unsub());
    }
  };
}

export const tickerRedis = {
  setLatest,
  getLatest,
  getExchangesLatest,
  subscribeExchangesLatest,
};


