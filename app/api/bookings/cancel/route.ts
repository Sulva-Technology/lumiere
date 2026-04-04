import { NextRequest, NextResponse } from 'next/server';

import { checkRateLimit } from '@/lib/rate-limit';
import { markReservationCancelled } from '@/lib/data/public';
import { cancelReservationSchema } from '@/lib/schemas';
import { assertTrustedOrigin, getClientIp } from '@/lib/security';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`booking-cancel:${ip}`, 20, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ data: null, error: 'Please wait a moment before trying again.', meta: null }, { status: 429 });
  }

  try {
    assertTrustedOrigin(request);
    const body = cancelReservationSchema.parse(await request.json());
    await markReservationCancelled(body.reservationId);
    return NextResponse.json({ data: { ok: true }, error: null, meta: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Unable to update booking status.', meta: null }, { status: 400 });
  }
}
