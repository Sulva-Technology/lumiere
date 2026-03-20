import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { getAdminCategories, getAdminProducts } from '@/lib/data/admin';

export async function GET() {
  try {
    await requireAdminApiUser();
    const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
    return NextResponse.json({ products, categories });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load products.' }, { status: 401 });
  }
}
