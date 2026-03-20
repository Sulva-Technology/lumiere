import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { getStoreSettings, updateStoreSettings } from '@/lib/data/admin';

export async function GET() {
  try {
    await requireAdminApiUser();
    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load settings.' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminApiUser();
    const body = await request.json();
    const settings = await updateStoreSettings(body);
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save settings.' }, { status: 400 });
  }
}
