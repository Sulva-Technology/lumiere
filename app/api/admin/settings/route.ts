import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminApiUser } from '@/lib/auth';
import { getStoreSettings, updateStoreSettings } from '@/lib/data/admin';
import { storeSettingsSchema } from '@/lib/schemas';

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
    const body = storeSettingsSchema.parse(await request.json());
    const settings = await updateStoreSettings(body);
    // The gallery switch also controls the menu link shown on every page.
    revalidatePath('/', 'layout');
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save settings.' }, { status: 400 });
  }
}
