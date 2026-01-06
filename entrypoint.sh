#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️ DATABASE_URL not set, skipping migrations"
else
  echo "🔄 Running Prisma migrations..."
  bunx prisma migrate deploy --schema=packages/db/prisma/schema.prisma
fi

echo "🚀 Starting API on port 3000..."
bun apps/server/dist/index.js &

echo "🌐 Starting Web on port 3001..."
bun apps/web/dist/index.js

wait
