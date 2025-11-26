import { EventEmitter } from 'events';
import type { Candle1s, CandleEvent, Exchange } from './type';
import { tickerRedis } from './ticker.redis.service';

class Aggregator extends EventEmitter {
    private currentSecond: number | null = null;
    private heartbeatInterval: any = null;
    
    // OHLC state
    private currentOpen = 0;
    private currentHigh = 0;
    private currentLow = 0;
    private currentClose = 0;

    constructor(private exchange: Exchange, private symbol: string) {
        super();
        this.setMaxListeners(100);
        
        // Start heartbeat to fill gaps if no trades occur
        this.heartbeatInterval = setInterval(() => this.checkHeartbeat(), 1000);
    }

    private checkHeartbeat() {
        if (this.currentSecond === null) return;

        const nowMs = Date.now();
        const nowSec = Math.floor(nowMs / 1000);

        // If we are entering a new second and haven't received a tick yet
        if (nowSec > this.currentSecond) {
            // console.log(`[Aggregator:${this.exchange}:${this.symbol}] Heartbeat gap fill: ${this.currentSecond} -> ${nowSec}`);
            // Feed a "tick" with the last known close price.
            this.tick(nowMs, this.currentClose);
        }
    }

    /**
     * Process a new trade tick.
     * Handles aggregation into 1s candles, including gap filling for missing seconds.
     */
    public tick(eventTimeMs: number, price: number) {
        // console.log(`[Aggregator:${this.exchange}:${this.symbol}] Tick: $${price} @ ${eventTimeMs}`);
        const eventSecond = Math.floor(eventTimeMs / 1000);

        // First tick ever: initialize state
        if (this.currentSecond === null) {
            this.startNewCandle(eventSecond, price);
            return;
        }

        // Same second: update current candle
        if (eventSecond === this.currentSecond) {
            this.updateCurrentCandle(price);
            return;
        }

        // New second: finalize previous, fill gaps, start new
        if (eventSecond > this.currentSecond) {
            this.finalizeAndEmitCurrentCandle();
            this.fillGaps(this.currentSecond + 1, eventSecond, this.currentClose);
            this.startNewCandle(eventSecond, price);
            return;
        }

        // Late tick (eventSecond < currentSecond): ignore out-of-order data
    }

    private startNewCandle(second: number, price: number) {
        this.currentSecond = second;
        this.currentOpen = price;
        this.currentHigh = price;
        this.currentLow = price;
        this.currentClose = price;
    }

    private updateCurrentCandle(price: number) {
        this.currentHigh = Math.max(this.currentHigh, price);
        this.currentLow = Math.min(this.currentLow, price);
        this.currentClose = price;
    }

    private finalizeAndEmitCurrentCandle() {
        if (this.currentSecond === null) return;

        const candle: Candle1s = {
            time: this.currentSecond,
            open: this.currentOpen,
            high: this.currentHigh,
            low: this.currentLow,
            close: this.currentClose,
            type: "real"
        };

        this.publishCandle(candle);
    }

    private fillGaps(startSec: number, endSec: number, lastClose: number) {
        for (let s = startSec; s < endSec; s++) {
            const syntheticCandle: Candle1s = {
                time: s,
                open: lastClose,
                high: lastClose,
                low: lastClose,
                close: lastClose,
                type: "synthetic"
            };
            this.publishCandle(syntheticCandle);
        }
    }

    private publishCandle(candle: Candle1s) {
        // Emit event for local listeners (e.g. WebSocket broadcasting)
        this.emit('candle', { 
            exchange: this.exchange, 
            symbol: this.symbol, 
            candle 
        } as CandleEvent);

        // Fire-and-forget write to Redis for persistence/distribution
        void tickerRedis.setLatest(this.exchange, this.symbol, candle);
    }
}

const aggregators = new Map<string, Aggregator>();

export function getAggregator(exchange: Exchange, symbol: string): Aggregator {
    const key = `${exchange}:${symbol}`;
    let agg = aggregators.get(key);
    if (!agg) {
        agg = new Aggregator(exchange, symbol);
        aggregators.set(key, agg);
    }
    return agg;
}
