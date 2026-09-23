import { NextRequest, NextResponse } from 'next/server';

import { checkRateLimit } from '@/lib/rate-limit';
import { confirmBookingFromCheckout } from '@/lib/data/public';
import { logEvent } from '@/lib/observability';
import { cancelReservationSchema } from '@/lib/schemas';
import { assertTrustedOrigin, getClientIp } from '@/lib/security';
import { getErrorMessage } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`booking-confirm:${ip}`, 20, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ data: null, error: 'Please wait a moment before trying again.', meta: null }, { status: 429 });
  }

  try {
    assertTrustedOrigin(request);
    const body = cancelReservationSchema.parse(await request.json());
    const result = await confirmBookingFromCheckout(body.reservationId);
    return NextResponse.json({ data: result, error: null, meta: null });
  } catch (error) {
    logEvent('error', 'booking.confirm_from_return_failed', { reason: getErrorMessage(error, 'unknown') });
    return NextResponse.json({ data: null, error: 'Unable to confirm booking status.', meta: null }, { status: 400 });
  }
}
