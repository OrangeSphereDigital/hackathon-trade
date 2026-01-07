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

# Copy everything (VPS build, env available)
COPY . .

# Install deps (NO frozen lockfile on VPS)
RUN bun install

# Prisma client
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

# Built output
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/web/dist ./apps/web/dist

# Runtime deps + workspace packages
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/packages/db/prisma ./packages/db/prisma

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000 3001
ENTRYPOINT ["/entrypoint.sh"]
