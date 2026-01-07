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

# Copy entire repo (REQUIRED for Bun workspaces)
COPY . .

# Install deps (no lockfile, workspace-safe)
RUN bun install

# Prisma needs DATABASE_URL at build time (dummy)
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
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

# App output
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/web/dist ./apps/web/dist

# Runtime deps + packages
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 3000 3001
ENTRYPOINT ["/entrypoint.sh"]
