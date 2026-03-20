import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/data/checkout';
import { checkRateLimit } from '@/lib/rate-limit';
import { checkoutSessionSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const rateLimit = checkRateLimit(`checkout:${ip}`, 15, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many checkout attempts. Please wait a moment and try again.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const input = checkoutSessionSchema.parse(body);
    const result = await createCheckoutSession(input);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to start checkout.' }, { status: 400 });
  }
}
