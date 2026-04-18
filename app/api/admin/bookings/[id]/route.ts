import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { deleteAdminBookingRow, updateBookingStatus } from '@/lib/data/admin';
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    const entryType = request.nextUrl.searchParams.get('entryType');

    if (entryType !== 'booking' && entryType !== 'reservation') {
      throw new Error('Missing booking row type.');
    }

    await deleteAdminBookingRow(id, entryType);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to delete booking row.' }, { status: 400 });
  }
}
