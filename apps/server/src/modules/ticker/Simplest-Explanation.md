# "Stupid Simple" Ticker Architecture

Here is the simple explanation of how the system handles 10,000 users without exploding.

## The Core Concept: "The News Station"

Imagine the server is a **News Station** and the users are **people with radios**.

1.  **The Source (Exchanges):** Binance and KuCoin are the reporters in the field. They scream *everything* happening ("BTC is up!", "ETH is down!") into a giant megaphone.
2.  **The Megaphone (Redis):** This megaphone broadcasts every single price change to the airwaves.
3.  **The Server (The Radio Tower):** The server listens to the airwaves.
4.  **The Users:** Users tune their radios to specific channels (e.g., "Channel BTC").

## The Magic Trick: "Fan-Out"

Here is what happens when **10,000 users** all want to see **BTC/USDT**:

```
      [ Binance ]                    [ KuCoin ]
           |                              |
           +-------------+----------------+
                         |
                         v
               ( 1. Updates Price )
                         |
                  [ Redis Pub/Sub ]
                         |
                         | ( 2. Sends UPDATE - Just ONE message )
                         |
                         v
            +--------------------------+
            |      YOUR SERVER         |
            | (Subscription Manager)   | <--- Magic happens here
            +--------------------------+
                         |
        +----------------+----------------+
        | ( 3. Copies message 10,000x )   |
        |                                 |
        v                                 v
  [ User 1 ]   ...   [ User 500 ]   ...   [ User 10,000 ]
  "BTC $95k"         "BTC $95k"           "BTC $95k"
```

## Step-by-Step Walkthrough

### 1. The Request (The "Tune In")
*   **User 1** connects and says: "I want to see **BTC**."
*   **Server** checks: "Am I currently listening to the `BTC` channel from Redis?"
    *   *Answer:* No.
    *   *Action:* The Server opens **1 connection** to Redis and says "Send me BTC updates."
*   **User 2** connects and says: "I want to see **BTC** too."
*   **Server** checks: "Am I currently listening to the `BTC` channel from Redis?"
    *   *Answer:* **YES.** I already did that for User 1.
    *   *Action:* **Do NOT call Redis.** Just add User 2 to the "BTC Mailing List".
*   ... fast forward to **User 10,000** ...
*   **User 10,000** connects and says: "I want BTC."
*   **Server** just adds them to the list.

**Result:** You have 10,000 users, but your server only has **1 open line** to Redis for BTC.

### 2. The Update (The "Broadcast")
*   Binance price changes.
*   Redis sends **ONE** message to the server: `{"symbol": "BTC", "price": 95000}`.
*   The server receives that single message.
*   The server looks at its "Mailing List" for BTC.
*   It loops through the list and shoots the message to all 10,000 sockets.

## Why It Scales
The system is scalable because **User Requests do not create Redis Requests.**

| Scenario | Redis Connections |
| :--- | :--- |
| **1 User** subscribing to BTC | 1 Connection |
| **100 Users** subscribing to BTC | **1 Connection** |
| **10,000 Users** subscribing to BTC | **1 Connection** |

The only work the server does is copying the message and handing it out, which computers are incredibly fast at.
