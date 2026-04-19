import { NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { getAdminPayments, reconcileAdminPaymentWithFallback } from '@/lib/data/admin';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    await request.json().catch(() => null);
    const result = await reconcileAdminPaymentWithFallback(id);
    const payments = await getAdminPayments();
    const payment = payments.find((item) => item.id === id) ?? null;
    return NextResponse.json({ result, payment });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Unable to reconcile payment.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
