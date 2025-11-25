# Ticker Module Architecture

This module handles real-time cryptocurrency price data (tickers) from multiple exchanges. It aggregates high-frequency trades into 1-second candles and distributes them via Redis to clients.

## Flow Overview

1.  **Collector**: Connects to external exchanges (Binance, KuCoin, etc.) via WebSocket to receive live trade data.
2.  **Aggregator**: Processes raw trades into 1-second candles.
    *   **Real Tick**: If trades occur within a second, a "real" candle is created.
    *   **Synthetic Tick**: If no trades occur for a second, the last known close price is carried forward as a "synthetic" candle to ensure data continuity.
3.  **Redis Storage**:
    *   **KV Store**: The latest candle is stored in Redis (`ticker:last:<exchange>:<symbol>`) for quick retrieval (e.g., initial API requests).
    *   **Pub/Sub**: The candle is published to a Redis channel (`ticker:pub:<exchange>:<symbol>`) for real-time subscribers.
4.  **WebSocket API**: Clients connect to the server's WebSocket endpoint to receive these live updates.

## Data Flow Diagram

```mermaid
graph LR
    A[Exchange (Binance/Kucoin)] -->|Raw Trades| B(Collector)
    B -->|Tick| C(Aggregator)
    C -->|1s Candle| D{Redis}
    D -->|SET| E[KV Store]
    D -->|PUBLISH| F[Pub/Sub Channel]
    F -->|SUBSCRIBE| G[WS Controller]
    G -->|JSON| H[Client]
```

## Key Components

### 1. `candle-agg.ts` (The Aggregator)
-   **Input**: Raw trade price & time.
-   **Logic**:
    -   Maintains OHLC (Open, High, Low, Close) state for the current second.
    -   When a new second starts, it finalizes the previous second's candle.
    -   **Gap Filling**: If seconds are skipped (no trades), it generates "synthetic" candles using the last close price.
-   **Output**: Emits `Candle1s` events and calls `tickerRedis.setLatest`.

### 2. `ticker.redis.service.ts` (The Storage Layer)
-   **`setLatest`**: Saves the candle to Redis and broadcasts it.
-   **`getExchangesLatest`**: Fetches the most recent candle for a list of exchanges (used for initial state).
-   **`subscribeExchangesLatest`**: Subscribes to Redis channels to forward real-time updates to the WebSocket controller.

## Dynamic Exchange Support
The system supports dynamic exchanges and symbols. You can request data for any supported exchange (defined in `Exchange` type) and symbol pair (e.g., `SOLUSDT`).

Example Redis Key: `ticker:last:binance:SOLUSDT`
Example Redis Channel: `ticker:pub:binance:SOLUSDT`
