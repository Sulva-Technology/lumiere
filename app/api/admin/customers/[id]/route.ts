import { NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { deleteAdminCustomer } from '@/lib/data/admin';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    await deleteAdminCustomer(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to delete customer.' }, { status: 400 });
  }
}
