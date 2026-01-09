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

# Prisma (dummy DB URL only for generate)
ENV DATABASE_URL=postgresql://user:pass@localhost:5432/db
RUN cd packages/db && bunx prisma generate

# Build apps
RUN bunx turbo run build --filter=server...
RUN bunx turbo run build --filter=web...

# =========================
# Runtime
# =========================
FROM oven/bun:1.3.3-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# REQUIRED for Prisma
RUN apt-get update -y && apt-get install -y openssl

# App builds
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/web/dist ./apps/web/dist

# Dependencies + Prisma schema/migrations
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

EXPOSE 3000 3001
