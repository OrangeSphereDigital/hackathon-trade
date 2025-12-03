import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from '@elysiajs/swagger'
import { auth } from "@root/auth";
import { tickerWsController } from "./modules/ticker/ticker.ws.controller";
import { BinanceTickerCollector } from "./modules/binance/collector";
import { KucoinTickerCollector } from "./modules/kucoin/collector";
import { redis } from "@/lib/redis";

// --- INIT & CLEANUP ---
// Clean old ticker data from Redis on startup
// We do this inside an async IIFE or just promise chain since top-level await is supported in Bun
await redis.flush('ticker:*');

// --- COLLECTOR MANAGEMENT (HOT RELOAD SAFE) ---
// Use globalThis to track collectors so they survive hot reloads and can be stopped
const GLOBAL_KEY = Symbol.for('app.collectors');
const globalCollectors = (globalThis as any)[GLOBAL_KEY] || { binance: null, kucoin: null, arbitrage: null };
(globalThis as any)[GLOBAL_KEY] = globalCollectors;

// Stop existing collectors if they exist (Hot Reload Cleanup)
if (globalCollectors.binance) {
    console.log('[System] Stopping previous Binance collector...');
    await globalCollectors.binance.stop();
}
if (globalCollectors.kucoin) {
    console.log('[System] Stopping previous KuCoin collector...');
    await globalCollectors.kucoin.stop();
}
if (globalCollectors.arbitrage) {
    console.log('[System] Stopping previous Arbitrage executor...');
    globalCollectors.arbitrage.stop();
}

import { SYMBOL_PAIRS } from './constants/constant';
import { startArbitrageBot, stopArbitrageBot } from "./modules/arbitrage/arbitrage.bnb.executor";

// Start the Ticker Collector for supported pairs
const SUPPORTED_PAIRS = Object.values(SYMBOL_PAIRS);

const binanceCollector = new BinanceTickerCollector(SUPPORTED_PAIRS);
void binanceCollector.start();
globalCollectors.binance = binanceCollector;

const kucoinCollector = new KucoinTickerCollector(SUPPORTED_PAIRS);
void kucoinCollector.start();
globalCollectors.kucoin = kucoinCollector;

// Start Arbitrage Executor
void startArbitrageBot();
// Store an object with a stop method to satisfy the cleanup contract
globalCollectors.arbitrage = { stop: stopArbitrageBot };


import { adminController } from "./modules/admin/admin.controller";
import { arbitrageController } from "./modules/arbitrage/arbitrage.controller";
import { arbitrageAdminController } from "./modules/arbitrage/arbitrage.admin.controller";
import { contactController } from "./modules/contact/contact.controller";

const app = new Elysia()
	.use(
		cors({
			origin: process.env.CORS_ORIGIN || "",
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
    .use(tickerWsController)
    .use(adminController)
	.use(arbitrageController)
    .use(arbitrageAdminController)
    .use(contactController)
	.all("/api/auth/*", async (context) => {
		const { request, status } = context;
		if (["POST", "GET"].includes(request.method)) {
			return auth.handler(request);
		}
		return status(405);
	})
	.get("/", () => "OK")
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});

app.use(swagger({
	autoDarkMode: true,
	version: '1.0.0',
	path: "/docs"
}))

export type App = typeof app 