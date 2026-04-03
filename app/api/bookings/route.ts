import { NextRequest, NextResponse } from 'next/server';
import { createBookingCheckout, getReservationById } from '@/lib/data/public';
import { checkRateLimit } from '@/lib/rate-limit';
import { createBookingSchema } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  try {
    const reservationId = request.nextUrl.searchParams.get('reservation');
    if (!reservationId) {
      return NextResponse.json({ error: 'Missing reservation.' }, { status: 400 });
    }

    const reservation = await getReservationById(reservationId);
    return NextResponse.json({ data: reservation, error: null, meta: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Unable to load booking status.', meta: null }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const rateLimit = checkRateLimit(`booking:${ip}`, 10, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many booking attempts. Please wait a moment and try again.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const input = createBookingSchema.parse(body);
    const session = await createBookingCheckout(input);
    return NextResponse.json({ data: session, error: null, meta: null }, { status: 201 });
  } catch {
    return NextResponse.json({ data: null, error: 'Unable to reserve that appointment right now.', meta: null }, { status: 400 });
  }
}
