import { NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { confirmPaidReservation } from '@/lib/data/admin';
import { logEvent } from '@/lib/observability';
import { getErrorMessage } from '@/lib/validation';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requireAdminApiUser();
    const result = await confirmPaidReservation(id);
    return NextResponse.json(result);
  } catch (error) {
    // Database errors are plain objects, not Error instances; keep their message.
    const message = getErrorMessage(error, 'Unable to confirm this booking.');
    logEvent('error', 'admin.reservation_confirm_failed', { reservationId: id, reason: message, error: JSON.stringify(error) });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
