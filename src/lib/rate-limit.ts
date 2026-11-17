const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 20;
const MAX_LOCAL_CLIENTS = 500;
const localHits = new Map<string, { resetAt: number; hits: number }>();

export type RateLimitResult = { allowed: boolean; unavailable: boolean };

function checkLocalLimit(key: string): RateLimitResult {
  const now = Date.now();
  const current = localHits.get(key);
  if (current && current.resetAt > now) {
    current.hits += 1;
    return { allowed: current.hits <= MAX_REQUESTS, unavailable: false };
  }
  // Local development fallback only. Production uses the shared database limiter below.
  if (localHits.size >= MAX_LOCAL_CLIENTS) {
    const oldest = localHits.keys().next().value;
    if (oldest) localHits.delete(oldest);
  }
  localHits.set(key, { resetAt: now + WINDOW_SECONDS * 1000, hits: 1 });
  return { allowed: true, unavailable: false };
}

async function clientKey(request: Request): Promise<string> {
  // Cloudflare overwrites cf-connecting-ip at the edge. Never use caller-controlled XFF here.
  // A missing edge address shares one conservative bucket rather than bypassing the limit.
  const address = request.headers.get("cf-connecting-ip") ?? "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(address));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function checkJarvisRateLimit(request: Request): Promise<RateLimitResult> {
  const key = await clientKey(request);
  if (process.env["NODE_ENV"] !== "production") return checkLocalLimit(key);

  const baseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!baseUrl || !serviceKey) return { allowed: false, unavailable: true };
  const bucket = Math.floor(Date.now() / (WINDOW_SECONDS * 1000));
  try {
    const response = await fetch(`${baseUrl}/rest/v1/rpc/consume_rate_limit`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_key: `jarvis:${key}:${bucket}` }),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return { allowed: false, unavailable: true };
    const hits: unknown = await response.json();
    if (typeof hits !== "number" || !Number.isInteger(hits))
      return { allowed: false, unavailable: true };
    return { allowed: hits <= MAX_REQUESTS, unavailable: false };
  } catch {
    return { allowed: false, unavailable: true };
  }
}
