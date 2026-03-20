import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { getAdminCustomers } from '@/lib/data/admin';

export async function GET() {
  try {
    await requireAdminApiUser();
    const customers = await getAdminCustomers();
    return NextResponse.json({ customers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load customers.' }, { status: 401 });
  }
}
