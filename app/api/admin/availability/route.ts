import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { adminAvailabilityCreateSchema, adminAvailabilityDeleteSchema } from '@/lib/schemas';
import { createAvailabilitySlot, deleteAvailabilitySlot, getAvailabilityAdminRows } from '@/lib/data/availability';

export async function GET() {
  try {
    await requireAdminApiUser();
    const availability = await getAvailabilityAdminRows();
    return NextResponse.json({ data: { availability }, error: null, meta: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Unable to load availability.', meta: null }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApiUser();
    const body = adminAvailabilityCreateSchema.parse(await request.json());
    const slot = await createAvailabilitySlot(body);
    return NextResponse.json({ data: { slot }, error: null, meta: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Unable to create the availability slot.', meta: null }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminApiUser();
    const { searchParams } = new URL(request.url);
    const body = adminAvailabilityDeleteSchema.parse({ id: searchParams.get('id') });
    await deleteAvailabilitySlot(body.id);
    return NextResponse.json({ data: { success: true }, error: null, meta: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Unable to remove that slot.', meta: null }, { status: 400 });
  }
}
