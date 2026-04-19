import { NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { getAdminPayments, reconcileAdminPayment } from '@/lib/data/admin';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    const result = await reconcileAdminPayment(id);
    const payments = await getAdminPayments();
    const payment = payments.find((item) => item.id === id) ?? null;
    return NextResponse.json({ result, payment });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to reconcile payment.' }, { status: 400 });
  }
}
