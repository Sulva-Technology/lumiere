import { NextRequest, NextResponse } from 'next/server';
import { createBookingCheckout, getReservationById } from '@/lib/data/public';
import { checkRateLimit } from '@/lib/rate-limit';
import { createBookingSchema } from '@/lib/schemas';
import { assertTrustedOrigin, getClientIp } from '@/lib/security';
import { logEvent } from '@/lib/observability';
import { getErrorMessage } from '@/lib/validation';

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
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`booking:${ip}`, 10, 60_000);

  if (!rateLimit.allowed) {
    logEvent('warn', 'booking.rate_limited', { ip });
    return NextResponse.json({ error: 'Too many booking attempts. Please wait a moment and try again.' }, { status: 429 });
  }

  try {
    assertTrustedOrigin(request);
    const body = await request.json();
    const input = createBookingSchema.parse(body);
    const session = await createBookingCheckout(input);
    return NextResponse.json({ data: session, error: null, meta: null }, { status: 201 });
  } catch (error) {
    console.error('Booking failed:', error);
    const message = getErrorMessage(error, 'Unable to reserve that appointment right now.');
    logEvent('warn', 'booking.create_failed', {
      ip,
      reason: getErrorMessage(error, 'unknown'),
      errorType: typeof error,
      hasMessage: Boolean(error && typeof error === 'object' && 'message' in error),
    });
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 400 });
  }
}
