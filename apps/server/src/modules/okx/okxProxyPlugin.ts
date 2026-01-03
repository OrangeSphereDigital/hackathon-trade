import { SocksProxyAgent } from "socks-proxy-agent";
import type { Elysia } from "elysia";

/**
 * 🔒 OKX WebSocket Proxy Rules (MANDATORY)
 * 
 * OKX WebSocket traffic is geo-blocked in local environments.
 * The following rules MUST be followed:
 * 
 * Local execution (NODE_ENV=development or local):
 * - OKX WebSocket MUST use a SOCKS5 proxy via AWS EC2.
 * - Proxy MUST be provided via LOCAL_OKX_PROXY.
 * - Application MUST fail fast if the proxy is missing or unreachable.
 * 
 * Production / EC2 execution:
 * - Proxy usage is STRICTLY FORBIDDEN.
 * - OKX WebSocket MUST connect directly.
 * 
 * Health enforcement:
 * - On startup, the application MUST verify proxy reachability.
 * - If the proxy cannot reach OKX, the process MUST terminate with a clear error.
 * 
 * Silent fallback is NOT allowed.
 * - No retries without proxy
 * - No bypass
 * - No environment guessing
 * 
 * Any AI-generated code MUST use resolveOkxAgent()
 * Direct WebSocket construction without this function is invalid.
 * 
 * Local setup (required):
 * ssh -i ec2.pem -D 1080 -N -C ec2-user@EC2_IP
 * export NODE_ENV=development
 * export LOCAL_OKX_PROXY=socks5://127.0.0.1:1080
 */

const isLocal =
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "local";

/**
 * Resolve OKX agent with strict rules
 */
export function resolveOkxAgent() {
    if (!isLocal) {
        // Production / EC2 MUST NOT use proxy
        return undefined;
    }

    const proxy = process.env.LOCAL_OKX_PROXY;

    if (!proxy) {
        throw new Error(`
❌ OKX WebSocket blocked in local environment.

LOCAL_OKX_PROXY is required when running locally.

Fix:
  export LOCAL_OKX_PROXY="socks5://127.0.0.1:1080"
  ssh -D 1080 -N -C ec2-user@EC2_IP

This application MUST NOT run locally without the proxy.
`);
    }

    return new SocksProxyAgent(proxy);
}

/**
 * Health check to confirm proxy reachability
 */
async function checkProxyHealth(agent: SocksProxyAgent) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
        const res = await fetch("https://www.okx.com", {
            // @ts-ignore - agent is supported in Bun's fetch but types might lag
            agent,
            signal: controller.signal
        });

        if (!res.ok && res.status !== 403) { // OKX might 403 bots but 200/OK is better. 
            // If it's reachable, it won't timeout or throw.
            throw new Error(`HTTP ${res.status}`);
        }
    } catch (err) {
        throw new Error(`
❌ LOCAL_OKX_PROXY is configured but unreachable.

Possible causes:
- SSH tunnel not running
- Wrong port
- EC2 instance unreachable
- Firewall / security group issue

Details:
${err}
`);
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Elysia plugin
 */
export const okxProxyPlugin = (app: Elysia) =>
    app.onStart(async () => {
        if (!isLocal) return;

        const agent = resolveOkxAgent();
        if (!agent) return;

        await checkProxyHealth(agent);

        console.log("✅ OKX proxy health check passed");
    });
