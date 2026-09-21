import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { logEvent } from '@/lib/observability';

const requestMap = new Map<string, { count: number; resetAt: number }>();

function fallbackRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const existing = requestMap.get(key);

  if (!existing || existing.resetAt <= now) {
    requestMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  requestMap.set(key, existing);

  return { allowed: true, remaining: maxRequests - existing.count, resetAt: existing.resetAt };
}

export async function checkRateLimit(key: string, maxRequests: number, windowMs: number) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max_requests: maxRequests,
      p_window_ms: windowMs,
    });

    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;
    return {
      allowed: Boolean(result?.allowed),
      remaining: Number(result?.remaining ?? 0),
      resetAt: result?.reset_at ? new Date(result.reset_at).getTime() : Date.now() + windowMs,
    };
  } catch (error) {
    logEvent('warn', 'rate_limit.fallback', {
      key,
      reason: error instanceof Error ? error.message : 'unknown',
    });
    return fallbackRateLimit(key, maxRequests, windowMs);
  }
}
