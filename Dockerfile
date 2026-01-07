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

# 1️⃣ Copy only dependency files (CACHE FRIENDLY)
COPY bun.lock package.json ./
COPY apps/*/package.json ./apps/*/
COPY packages/*/package.json ./packages/*/

# Install deps
RUN bun install

# 2️⃣ Copy the rest of the repo
COPY . .

# 3️⃣ Prisma needs DATABASE_URL at build time (dummy is fine)
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN cd packages/db && bunx prisma generate

# 4️⃣ Build apps
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

# Prisma schema (for migrations if needed)
COPY --from=build /app/packages/db/prisma ./packages/db/prisma

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000 3001
ENTRYPOINT ["/entrypoint.sh"]
