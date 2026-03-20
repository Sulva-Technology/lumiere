import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { getAdminOrders } from '@/lib/data/admin';

export async function GET() {
  try {
    await requireAdminApiUser();
    const orders = await getAdminOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load orders.' }, { status: 401 });
  }
}
