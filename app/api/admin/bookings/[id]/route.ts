import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { updateBookingStatus } from '@/lib/data/admin';
import { adminBookingStatusSchema } from '@/lib/schemas';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    const { status } = adminBookingStatusSchema.parse(await request.json());
    const booking = await updateBookingStatus(id, status);
    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update booking.' }, { status: 400 });
  }
}
