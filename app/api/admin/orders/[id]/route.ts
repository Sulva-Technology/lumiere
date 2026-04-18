import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { deleteAdminOrder, updateOrderStatus } from '@/lib/data/admin';
import { adminOrderStatusSchema } from '@/lib/schemas';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    const body = adminOrderStatusSchema.parse(await request.json());
    const order = await updateOrderStatus(id, {
      paymentStatus: body.paymentStatus,
      fulfillmentStatus: body.fulfillmentStatus,
    });
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update order.' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    await deleteAdminOrder(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to delete order.' }, { status: 400 });
  }
}
