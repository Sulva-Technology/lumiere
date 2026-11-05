import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { rescheduleBooking } from '@/lib/data/admin';
import { adminBookingServiceChangeSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/validation';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminApiUser();
    const { id } = await params;
    const body = adminBookingServiceChangeSchema.parse(await request.json());
    const result = await rescheduleBooking({ bookingId: id, ...body, actorUserId: user.id });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to change this booking service.') }, { status: 400 });
  }
}
