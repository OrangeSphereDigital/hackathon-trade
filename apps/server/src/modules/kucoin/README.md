# KuCoin Ticker Module

This module fetches real-time price data from KuCoin using their WebSocket API.

## How It Works

Unlike Binance, KuCoin requires a dynamic **Handshake** before connecting.

1.  **Get Token:**
    *   We make a `POST` request to `https://api.kucoin.com/api/v1/bullet-public`.
    *   Response contains a connection **token** and a **server endpoint**.

2.  **Connect:**
    *   We connect to the WebSocket: `wss://ws-api.kucoin.com/endpoint?token={token}`.

3.  **Subscribe:**
    *   We send a subscribe message for the pairs we want:
    ```json
    {
      "type": "subscribe",
      "topic": "/market/ticker:SOL-USDT,ETH-USDT"
    }
    ```

## File Structure
*   `collector.ts`: Handles the handshake, connection, and data normalization.
*   `constant.ts`: Defines supported pairs and API endpoints.
