/**
 * A small in-memory, per-key limiter for the chat API (PLAN.md §6.2). It's a sliding window: a
 * key may make `limit` requests in any `windowMs` stretch. On serverless each instance keeps
 * its own map, so this is best effort; the Gemini free-tier quota is the real backstop (§6.4).
 */

export type RateLimitResult =
  { ok: true; remaining: number } | { ok: false; retryAfterSeconds: number };

interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  /** Injectable clock for tests. */
  now?: () => number;
  /** Past this many keys, expired ones are swept so the map can't grow without bound. */
  maxKeys?: number;
}

export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
  maxKeys = 10_000,
}: RateLimiterOptions) {
  const hits = new Map<string, number[]>();

  function sweep(time: number) {
    for (const [key, times] of hits) {
      if (times.every((t) => time - t >= windowMs)) hits.delete(key);
    }
  }

  return {
    /** Records a request for `key` if it's allowed. Blocked requests aren't counted. */
    check(key: string): RateLimitResult {
      const time = now();
      const recent = (hits.get(key) ?? []).filter((t) => time - t < windowMs);

      if (recent.length >= limit) {
        hits.set(key, recent);
        const oldest = recent[0] ?? time;
        return {
          ok: false,
          retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - time) / 1000)),
        };
      }

      recent.push(time);
      hits.set(key, recent);
      if (hits.size > maxKeys) sweep(time);
      return { ok: true, remaining: limit - recent.length };
    },
    /** Number of keys being tracked (for tests). */
    get size() {
      return hits.size;
    },
  };
}

/**
 * The visitor's IP: the first entry of `x-forwarded-for` (on Vercel, the platform sets it),
 * then `x-real-ip`. Everyone without either shares one "unknown" allowance.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
