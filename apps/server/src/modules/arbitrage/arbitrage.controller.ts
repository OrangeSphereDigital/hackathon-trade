import { Elysia, t } from "elysia";
import prisma from "@root/db";
import { authGuard } from "@/guards/auth.guard";

export const arbitrageController = new Elysia({ prefix: "/arbitrage" })
    .use(authGuard())
    .get(
        "/",
        async ({ query }) => {
            const { limit = 20, offset = 0 } = query;
            const items = await prisma.arbitrageOpportunity.findMany({
                take: Number(limit),
                skip: Number(offset),
                orderBy: { createdAt: "desc" },
            });
            const total = await prisma.arbitrageOpportunity.count();
            return { items, total };
        },
        {
            query: t.Object({
                limit: t.Optional(t.Numeric()),
                offset: t.Optional(t.Numeric()),
            }),
            detail: {
                tags: ["Arbitrage"],
                summary: "List arbitrage opportunities",
            }
        }
    )
    .get(
        "/:id",
        async ({ params: { id }, error }) => {
            const item = await prisma.arbitrageOpportunity.findUnique({
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
                tags: ["Arbitrage"],
                summary: "Get arbitrage opportunity details",
            }
        }
    );
