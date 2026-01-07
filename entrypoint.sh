#!/bin/sh
set -e

echo "Starting server..."
bun run apps/server/dist/index.js &

echo "Starting web..."
bun run apps/web/dist/index.js &

wait
