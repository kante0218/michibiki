interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);

export function rateLimit({
  maxRequests = 10,
  windowMs = 60_000,
}: {
  maxRequests?: number;
  windowMs?: number;
} = {}) {
  return function check(identifier: string): { success: boolean; remaining: number } {
    const now = Date.now();
    const entry = store.get(identifier);

    if (!entry || now > entry.resetAt) {
      store.set(identifier, { count: 1, resetAt: now + windowMs });
      return { success: true, remaining: maxRequests - 1 };
    }

    if (entry.count >= maxRequests) {
      return { success: false, remaining: 0 };
    }

    entry.count++;
    return { success: true, remaining: maxRequests - entry.count };
  };
}
