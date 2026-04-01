import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { deleteAdminProduct } from '@/lib/data/admin';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    await deleteAdminProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to delete product.' }, { status: 400 });
  }
}
