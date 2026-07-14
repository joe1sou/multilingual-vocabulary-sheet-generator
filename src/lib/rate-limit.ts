type RateLimitEntry = { count: number; resetAt: number };

const globalStore = globalThis as typeof globalThis & {
  vocabularyStudioRateLimits?: Map<string, RateLimitEntry>;
};

const store =
  globalStore.vocabularyStudioRateLimits ??
  (globalStore.vocabularyStudioRateLimits = new Map<string, RateLimitEntry>());

export function getRequestIdentifier(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

export function checkRateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowMs = 10 * 60 * 1000,
) {
  const now = Date.now();
  const key = `${scope}:${identifier}`;
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1_000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
