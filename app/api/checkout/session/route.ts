import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/data/checkout';
import { checkRateLimit } from '@/lib/rate-limit';
import { checkoutSessionSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const rateLimit = checkRateLimit(`checkout:${ip}`, 15, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ data: null, error: 'Too many checkout attempts. Please wait a moment and try again.', meta: null }, { status: 429 });
  }

  try {
    const body = await request.json();
    const input = checkoutSessionSchema.parse(body);
    const result = await createCheckoutSession(input);
    return NextResponse.json({ data: result, error: null, meta: null }, { status: 201 });
  } catch {
    return NextResponse.json({ data: null, error: 'Unable to start secure checkout.', meta: null }, { status: 400 });
  }
}
