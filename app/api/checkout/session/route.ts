import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/data/checkout';
import { checkRateLimit } from '@/lib/rate-limit';
import { checkoutSessionSchema } from '@/lib/schemas';
import { assertTrustedOrigin, getClientIp } from '@/lib/security';
import { logEvent } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`checkout:${ip}`, 15, 60_000);

  if (!rateLimit.allowed) {
    logEvent('warn', 'checkout.rate_limited', { ip });
    return NextResponse.json({ data: null, error: 'Too many checkout attempts. Please wait a moment and try again.', meta: null }, { status: 429 });
  }

  try {
    assertTrustedOrigin(request);
    const body = await request.json();
    const input = checkoutSessionSchema.parse(body);
    const result = await createCheckoutSession(input);
    return NextResponse.json({ data: result, error: null, meta: null }, { status: 201 });
  } catch (error) {
    logEvent('warn', 'checkout.session_failed', {
      ip,
      reason: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json({ data: null, error: 'Unable to start secure checkout.', meta: null }, { status: 400 });
  }
}
