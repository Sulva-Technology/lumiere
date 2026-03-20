import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/lib/data/public';
import { checkRateLimit } from '@/lib/rate-limit';
import { createBookingSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const rateLimit = checkRateLimit(`booking:${ip}`, 10, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many booking attempts. Please wait a moment and try again.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const input = createBookingSchema.parse(body);
    const booking = await createBooking(input);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create booking.' }, { status: 400 });
  }
}
