import { Elysia, t } from "elysia";
import prisma from "@root/db";
import { authGuard } from "@/guards/auth.guard";

export const simulationController = new Elysia({ prefix: "/simulation" })
    .use(authGuard())
    .get(
        "/",
        async ({ query }) => {
            const { limit = 20, offset = 0 } = query;
            const items = await prisma.simulatedTrade.findMany({
                take: Number(limit),
                skip: Number(offset),
                orderBy: { createdAt: "desc" },
            });
            const total = await prisma.simulatedTrade.count();
            return { items, total };
        },
        {
            query: t.Object({
                limit: t.Optional(t.Numeric()),
                offset: t.Optional(t.Numeric()),
            }),
            detail: {
                tags: ["Simulation"],
                summary: "List simulated trades",
            },
        }
    )
    .get(
        "/:id",
        async ({ params: { id }, error }) => {
            const item = await (prisma as any).simulatedTrade.findUnique({
                where: { id },
            });
            if (!item) return error(404, "Not found");
            return item;
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ["Simulation"],
                summary: "Get simulated trade details",
            },
        }
    );
