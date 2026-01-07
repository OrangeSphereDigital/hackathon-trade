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

# Copy entire repo to handle workspace deps properly
COPY . .
RUN bun install

# Prisma generation might be needed if web uses shared types that depend on prisma
ENV DATABASE_URL=postgresql://user:pass@localhost:5432/db
RUN cd packages/db && bunx prisma generate

# Build ONLY Web
RUN bunx turbo run build --filter=web...

# =========================
# Runtime
# =========================
FROM oven/bun:1.3.3-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Web static build
COPY --from=build /app/apps/web/dist ./apps/web/dist

# Shared deps not strictly needed for static serve if using `bunx serve` (it downloads its deps) 
# or if we use the simple script. `serve` might need node_modules if it was installed as a dep.
# But `bunx serve` usually works.
# However, for safety and speed, let's copy node_modules.
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3001

CMD ["bunx", "serve", "apps/web/dist", "-l", "3001", "-s"]
