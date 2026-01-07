#!/bin/sh
set -e

echo "Starting server..."
bun run apps/server/dist/index.js &

echo "Starting web..."
# Create a robust static file server for the SPA using Bun native APIs
cat <<EOF > web_server.ts
const port = 3001;
const base = "apps/web/dist";

console.log(\`Serving \${base} on port \${port}\`);

Bun.serve({
  port,
  async fetch(req) {
    let path = new URL(req.url).pathname;
    if (path === "/") path = "/index.html";
    
    // Try to serve the static file
    const f = Bun.file(base + path);
    if (await f.exists()) return new Response(f);
    
    // SPA fallback: return index.html for non-existent files (unless it looks like an asset request, but simple fallback is fine)
    return new Response(Bun.file(base + "/index.html"));
  },
});
EOF

bun run web_server.ts &

wait
