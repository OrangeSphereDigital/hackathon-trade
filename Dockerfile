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

# Prisma (dummy DB URL for generate)
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

# API build
COPY --from=build /app/apps/server/dist ./apps/server/dist

# Web static build
COPY --from=build /app/apps/web/dist ./apps/web/dist

# Shared deps
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

EXPOSE 3000 3001
