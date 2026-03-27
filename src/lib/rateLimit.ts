import { createServiceClient } from '@/lib/supabase/server';

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function normalizeKey(scope: string, identifier: string) {
  return `${scope}:${identifier.trim().toLowerCase()}`;
}

export async function consumeRateLimit(
  scope: string,
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const service = createServiceClient();
  if (!service) {
    // Fail-open in local/dev if service role is unavailable.
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const key = normalizeKey(scope, identifier);
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000);
  const nextWindowStartMs = windowStart.getTime() + windowSeconds * 1000;

  const { data: existing } = await service
    .from('request_rate_limits')
    .select('request_count, window_start')
    .eq('key', key)
    .maybeSingle();

  if (!existing) {
    await service.from('request_rate_limits').upsert({
      key,
      scope,
      window_start: windowStart.toISOString(),
      request_count: 1,
      updated_at: new Date(now).toISOString(),
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const existingWindowStart = new Date(existing.window_start).getTime();
  if (existingWindowStart !== windowStart.getTime()) {
    await service
      .from('request_rate_limits')
      .update({
        scope,
        window_start: windowStart.toISOString(),
        request_count: 1,
        updated_at: new Date(now).toISOString(),
      })
      .eq('key', key);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const nextCount = (existing.request_count ?? 0) + 1;
  await service
    .from('request_rate_limits')
    .update({
      request_count: nextCount,
      updated_at: new Date(now).toISOString(),
    })
    .eq('key', key);

  if (nextCount > maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((nextWindowStartMs - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
