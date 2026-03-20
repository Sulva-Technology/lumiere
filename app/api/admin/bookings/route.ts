import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { getAdminBookings } from '@/lib/data/admin';

export async function GET() {
  try {
    await requireAdminApiUser();
    const bookings = await getAdminBookings();
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load bookings.' }, { status: 401 });
  }
}
