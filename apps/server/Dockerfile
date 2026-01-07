# =========================
# Base
# =========================
FROM oven/bun:1.3.3 AS base
WORKDIR /app
ENV NODE_ENV=production

# =========================
# Build
# =========================
FROM base AS build

COPY . .
RUN bun install

# Prisma
ENV DATABASE_URL=postgresql://user:pass@localhost:5432/db
RUN cd packages/db && bunx prisma generate

# Build ONLY Server
RUN bunx turbo run build --filter=server...

# =========================
# Runtime
# =========================
FROM oven/bun:1.3.3-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# API build
COPY --from=build /app/apps/server/dist ./apps/server/dist

# Shared deps
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

EXPOSE 3000

CMD ["bun", "run", "apps/server/dist/index.js"]
