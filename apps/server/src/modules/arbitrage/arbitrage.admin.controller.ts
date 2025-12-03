import { Elysia } from "elysia";
import { authGuard } from "@/guards/auth.guard";
import { rolesGuard } from "@/guards/role.guard";
import { startArbitrageBot, stopArbitrageBot } from "./arbitrage.bnb.executor";
import { arbitrageStatus } from "./arbitrage.status.service";

export const arbitrageAdminController = new Elysia({ prefix: "/admin/arbitrage" })
    .use(authGuard())
    .guard({ 
        // beforeHandle: rolesGuard(["admin"]) // Temporarily disabled if auth/roles are complex to setup for the user right now, but requested by user.
        // Actually, I'll enable it since the user asked for "admin dashboard".
        beforeHandle: rolesGuard(["admin"])
    })
    .get("/status", () => {
        return {
            ...arbitrageStatus.currentStatus,
            logs: arbitrageStatus.getRecentLogs()
        };
    }, {
        detail: {
            tags: ["Admin", "Arbitrage"],
            summary: "Get bot status"
        }
    })
    .post("/start", async () => {
        await startArbitrageBot();
        return { success: true, message: "Bot started" };
    }, {
        detail: {
            tags: ["Admin", "Arbitrage"],
            summary: "Start bot"
        }
    })
    .post("/stop", () => {
        stopArbitrageBot();
        return { success: true, message: "Bot stopped" };
    }, {
        detail: {
            tags: ["Admin", "Arbitrage"],
            summary: "Stop bot"
        }
    })
    .ws("/live", {
        open(ws) {
            const unsubs: (() => void)[] = [];
            
            // Subscribe to status updates
            unsubs.push(arbitrageStatus.subscribeStatus((status) => {
                ws.send({ type: 'status', data: status });
            }));
            
            // Subscribe to new logs
            unsubs.push(arbitrageStatus.subscribeLogs((log) => {
                ws.send({ type: 'log', data: log });
            }));

            // Store unsubs in the WS instance data (implicitly typed as any here for simplicity)
            // @ts-ignore
            ws.data.unsubs = unsubs;
        },
        close(ws) {
            // @ts-ignore
            const unsubs = ws.data.unsubs as (() => void)[];
            if (unsubs) {
                unsubs.forEach(u => u());
            }
        },
        message(ws, message) {
            // Handle incoming messages if needed
        }
    });
