import { NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { getAdminPayments } from '@/lib/data/admin';

export async function GET() {
  try {
    await requireAdminApiUser();
    const payments = await getAdminPayments();
    return NextResponse.json({ payments });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load payments.' }, { status: 401 });
  }
}
