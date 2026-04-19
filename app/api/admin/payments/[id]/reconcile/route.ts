import { NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { getAdminPayments, reconcileAdminPayment } from '@/lib/data/admin';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const result = await reconcileAdminPayment(id, {
      force: body?.force === true,
    });
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
