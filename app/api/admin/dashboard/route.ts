import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { getDashboardMetrics } from '@/lib/data/admin';

export async function GET() {
  try {
    await requireAdminApiUser();
    const metrics = await getDashboardMetrics();
    return NextResponse.json({ metrics });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load dashboard.' }, { status: 401 });
  }
}
