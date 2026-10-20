import { NextRequest, NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { getRescheduleOptions, rescheduleBooking } from '@/lib/data/admin';
import { logEvent } from '@/lib/observability';
import { adminBookingRescheduleSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/validation';

/** Times on ?day=yyyy-mm-dd that fit her usual hours, for the reschedule picker. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    const day = request.nextUrl.searchParams.get('day') ?? '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('Choose a date.');
    return NextResponse.json(await getRescheduleOptions(id, day));
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to load open times.') }, { status: 400 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requireAdminApiUser();
    const body = adminBookingRescheduleSchema.parse(await request.json());
    const result = await rescheduleBooking({ bookingId: id, ...body });
    return NextResponse.json(result);
  } catch (error) {
    const message = getErrorMessage(error, 'Unable to move this booking.');
    logEvent('error', 'admin.booking_reschedule_failed', { bookingId: id, reason: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
