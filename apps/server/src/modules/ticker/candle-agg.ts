import { EventEmitter } from 'events';
import type { TickerData, CandleEvent, Exchange } from './type';
import { tickerRedis } from './ticker.redis.service';

const MAX_SYNTHETIC_FILLS = 3;

class Aggregator extends EventEmitter {
    private currentSecond: number | null = null;
    private heartbeatInterval: any = null;
    private syntheticFillCount = 0;
    
    // State
    private lastPrice = 0;
    private currentBid = 0;
    private currentAsk = 0;

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
            // Only fill if we haven't exceeded the max consecutive fills
            if (this.syntheticFillCount < MAX_SYNTHETIC_FILLS) {
                this.syntheticFillCount++;
                // Feed a "tick" with the last known state (synthetic)
                this.processTick(nowSec, this.lastPrice, this.currentBid, this.currentAsk, true);
            }
        }
    }

    /**
     * Process a new trade tick.
     */
    public tick(eventTimeMs: number, price: number, bid: number = 0, ask: number = 0) {
        const eventSecond = Math.floor(eventTimeMs / 1000);
        // Real tick received, reset synthetic counter
        this.syntheticFillCount = 0;
        this.processTick(eventSecond, price, bid, ask, false);
    }

    private processTick(eventSecond: number, price: number, bid: number, ask: number, isSynthetic: boolean) {
        // First tick ever
        if (this.currentSecond === null) {
            this.currentSecond = eventSecond;
            this.updateState(price, bid, ask);
            return;
        }

        // Same second: just update latest state
        if (eventSecond === this.currentSecond) {
            this.updateState(price, bid, ask);
            return;
        }

        // New second: emit previous, maybe fill gaps, start new
        if (eventSecond > this.currentSecond) {
            this.emitCurrent(isSynthetic ? "synthetic" : "real"); // The PREVIOUS second is what we are emitting
            
            // Fill gaps if we jumped more than 1 second (and aren't already synthetic filling from heartbeat)
            // Note: Heartbeat handles 1s increments. If a REAL tick jumps 5 seconds, we might want to fill gaps or just jump.
            // For simplicity/safety in arb, we just jump if it's a big gap from a real tick. 
            // But let's respect the max fill rule even here.
            this.fillGaps(this.currentSecond + 1, eventSecond);

            this.currentSecond = eventSecond;
            this.updateState(price, bid, ask);
        }
    }

    private updateState(price: number, bid: number, ask: number) {
        this.lastPrice = price;
        if (bid) this.currentBid = bid;
        if (ask) this.currentAsk = ask;
    }

    private emitCurrent(type: "real" | "synthetic") {
        if (this.currentSecond === null) return;

        const data: TickerData = {
            time: this.currentSecond,
            bestBid: this.currentBid,
            bestAsk: this.currentAsk,
            lastPrice: this.lastPrice,
            type: type === "real" && this.syntheticFillCount > 0 ? "synthetic" : type // If we filled this via heartbeat, it's synthetic
        };

        // If we are emitting, reset synthetic count if it was a real close? 
        // No, syntheticFillCount is managed by tick() vs checkHeartbeat().
        
        this.publish(data);
    }

    private fillGaps(startSec: number, endSec: number) {
        // Only fill up to MAX_SYNTHETIC_FILLS
        let filled = 0;
        for (let s = startSec; s < endSec; s++) {
            if (this.syntheticFillCount >= MAX_SYNTHETIC_FILLS) break;
            
            const data: TickerData = {
                time: s,
                bestBid: this.currentBid,
                bestAsk: this.currentAsk,
                lastPrice: this.lastPrice,
                type: "synthetic"
            };
            this.publish(data);
            this.syntheticFillCount++;
        }
    }

    private publish(data: TickerData) {
        this.emit('candle', { 
            exchange: this.exchange, 
            symbol: this.symbol, 
            candle: data 
        } as CandleEvent);

        void tickerRedis.setLatest(this.exchange, this.symbol, data as any); // Type cast to avoid breaking if Candle1s mismatch temporarily
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

