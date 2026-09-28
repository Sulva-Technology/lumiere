import { NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { confirmPaidReservation } from '@/lib/data/admin';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    const result = await confirmPaidReservation(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to confirm this booking.' }, { status: 400 });
  }
}
