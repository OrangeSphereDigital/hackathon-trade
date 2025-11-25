import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from '@elysiajs/swagger'
import { auth } from "@root/auth";
import { tickerWsController } from "./modules/ticker/ticker.ws.controller";
import { BinanceTickerCollector } from "./modules/binance/collector";

// Start the Ticker Collector for supported pairs
const SUPPORTED_PAIRS = ['SOLUSDT', 'ETHUSDT', 'BTCUSDT', 'BNBUSDT'];
const binanceCollector = new BinanceTickerCollector(SUPPORTED_PAIRS);
void binanceCollector.start();

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