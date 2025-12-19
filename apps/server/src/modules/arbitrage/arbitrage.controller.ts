import { Elysia, t } from "elysia";
import prisma from "@root/db";
import { authGuard } from "@/guards/auth.guard";

export const arbitrageController = new Elysia({ prefix: "/arbitrage" })
    .use(authGuard())
    .get(
        "/",
        async ({ query }) => {
            const {
                limit = 20,
                offset,
                page,
                dateFrom,
                dateTo,
            } = query as {
                limit?: number;
                offset?: number;
                page?: number;
                dateFrom?: string;
                dateTo?: string;
            };

            const take = Number(limit) || 20;
            let skip = typeof offset === "number" ? Number(offset) : 0;

            if (typeof page === "number" && !offset) {
                const safePage = page > 0 ? page : 1;
                skip = (safePage - 1) * take;
            }

            const where: Record<string, any> = {};

            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom) {
                    where.createdAt.gte = new Date(dateFrom);
                }
                if (dateTo) {
                    where.createdAt.lte = new Date(dateTo);
                }
            }

            const items = await prisma.arbitrageOpportunity.findMany({
                take,
                skip,
                where: Object.keys(where).length ? where : undefined,
                orderBy: { createdAt: "desc" },
            });
            const total = await prisma.arbitrageOpportunity.count({
                where: Object.keys(where).length ? where : undefined,
            });
            return { items, total };
        },
        {
            query: t.Object({
                limit: t.Optional(t.Numeric()),
                offset: t.Optional(t.Numeric()),
                page: t.Optional(t.Numeric()),
                dateFrom: t.Optional(t.String()),
                dateTo: t.Optional(t.String()),
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
