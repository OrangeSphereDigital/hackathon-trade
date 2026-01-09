import { createClient, type RedisClientType } from 'redis';
import { env } from '@/constants/env';
import type { Exchange, TickerData } from './type';

/**
 * Generates the Redis Pub/Sub channel name for live updates.
 * Format: ticker:pub:<exchange>:<symbol>
 */
function getPubSubChannel(exchange: Exchange, symbol: string) {
    return `ticker:pub:${exchange}:${symbol}`;
}

export type CandleCallback = (exchange: Exchange, candle: TickerData) => void;

export class SubscriptionManager {
    private static instance: SubscriptionManager;
    private subscriber: RedisClientType | null = null;

    // channelName -> Set of callbacks
    private listeners = new Map<string, Set<CandleCallback>>();
    // channelName -> { exchange, symbol } (reverse lookup for parsing)
    private channelInfo = new Map<string, { exchange: Exchange, symbol: string }>();

    private constructor() { }

    public static getInstance(): SubscriptionManager {
        if (!SubscriptionManager.instance) {
            SubscriptionManager.instance = new SubscriptionManager();
        }
        return SubscriptionManager.instance;
    }

    private async getSubscriber() {
        if (!this.subscriber) {
            if (!env.APP_REDIS_URL) throw new Error('APP_REDIS_URL not set');
            this.subscriber = createClient({ url: env.APP_REDIS_URL });

            this.subscriber.on('error', (err) => console.error('[TickerSub] Redis Error:', err));

            await this.subscriber.connect();
            console.log('[TickerSub] Shared subscriber connected');
        }
        return this.subscriber;
    }

    public async subscribe(
        exchange: Exchange,
        symbol: string,
        callback: CandleCallback
    ) {
        const subscriber = await this.getSubscriber();
        const channel = getPubSubChannel(exchange, symbol);

        // 1. Register the callback
        if (!this.listeners.has(channel)) {
            this.listeners.set(channel, new Set());
            this.channelInfo.set(channel, { exchange, symbol });

            // 2. If this is the first listener, actually subscribe to Redis
            await subscriber.subscribe(channel, (message) => {
                this.handleMessage(channel, message);
            });
        }

        this.listeners.get(channel)!.add(callback);

        // Return unsubscribe function
        return () => this.unsubscribe(exchange, symbol, channel, callback);
    }

    private async unsubscribe(
        exchange: Exchange,
        symbol: string,
        channel: string,
        callback: CandleCallback
    ) {
        const callbacks = this.listeners.get(channel);
        if (!callbacks) return;

        // 1. Remove the specific callback
        callbacks.delete(callback);

        // 2. If no listeners left, unsubscribe from Redis
        if (callbacks.size === 0) {
            this.listeners.delete(channel);
            this.channelInfo.delete(channel);
            if (this.subscriber && this.subscriber.isOpen) {
                try {
                    await this.subscriber.unsubscribe(channel);
                    // console.log(`[TickerSub] Unsubscribed from ${exchange}:${symbol}`);
                } catch (err) {
                    console.warn(`[TickerSub] Unsubscribe failed for ${exchange}:${symbol}:`, err);
                }
            }
        }
    }

    private handleMessage(channel: string, message: string) {
        const info = this.channelInfo.get(channel);
        const callbacks = this.listeners.get(channel);

        if (!info || !callbacks || callbacks.size === 0) return;

        try {
            const candle = JSON.parse(message) as TickerData;
            // Fan-out to all listeners
            for (const cb of callbacks) {
                cb(info.exchange, candle);
            }
        } catch (error) {
            console.error(`[TickerSub] Failed to parse message on ${channel}:`, error);
        }
    }
}
