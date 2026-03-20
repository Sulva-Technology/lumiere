const requestMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const existing = requestMap.get(key);

  if (!existing || existing.resetAt <= now) {
    requestMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  requestMap.set(key, existing);

  return { allowed: true, remaining: maxRequests - existing.count };
}

