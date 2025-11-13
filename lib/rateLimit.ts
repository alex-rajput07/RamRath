const buckets = new Map<string, { tokens: number; lastRefill: number }>();

// Simple token bucket rate limiter per IP. In-memory only — for production use Redis or other shared store.
export function rateLimit(key: string, { tokens = 10, refillInterval = 60_000 }: { tokens?: number; refillInterval?: number } = {}) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { tokens, lastRefill: now };
    buckets.set(key, b);
  }
  // refill logic
  const elapsed = now - b.lastRefill;
  if (elapsed > refillInterval) {
    b.tokens = tokens;
    b.lastRefill = now;
  }
  if (b.tokens > 0) {
    b.tokens -= 1;
    return { ok: true, remaining: b.tokens };
  }
  return { ok: false, remaining: 0 };
}
