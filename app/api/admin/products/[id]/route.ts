import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { deleteAdminProduct } from '@/lib/data/admin';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminApiUser();
    const { id } = await params;
    const result = await deleteAdminProduct(id, admin.id);
    return NextResponse.json({ ok: true, mode: result.mode });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to delete product.' }, { status: 400 });
  }
}
