import { NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { resendBookingConfirmationEmail } from '@/lib/data/admin';
import { logEvent } from '@/lib/observability';
import { getErrorMessage } from '@/lib/validation';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requireAdminApiUser();
    const sent = await resendBookingConfirmationEmail(id);
    return NextResponse.json({ ok: true, sent });
  } catch (error) {
    // Database errors are plain objects, not Error instances; keep their message.
    const message = getErrorMessage(error, 'Unable to resend booking email.');
    logEvent('error', 'admin.booking_email_failed', { bookingId: id, reason: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
