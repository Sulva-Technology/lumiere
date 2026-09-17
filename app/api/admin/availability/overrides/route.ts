import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { adminAvailabilityDeleteSchema, adminAvailabilityOverrideSchema } from '@/lib/schemas';
import { applyDayOverride, deleteDayOverride, getDayOverrides } from '@/lib/data/availability';
import { getErrorMessage } from '@/lib/validation';

export async function GET(request: Request) {
  try {
    await requireAdminApiUser();
    const { searchParams } = new URL(request.url);
    const stylistId = searchParams.get('stylistId') ?? undefined;
    const overrides = await getDayOverrides(stylistId);
    return NextResponse.json({ data: { overrides }, error: null, meta: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: getErrorMessage(error, 'Unable to load your day changes.'), meta: null },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApiUser();
    const body = adminAvailabilityOverrideSchema.parse(await request.json());
    const result = await applyDayOverride(body);
    return NextResponse.json({ data: result, error: null, meta: null }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: getErrorMessage(error, 'Unable to save that day.'), meta: null },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminApiUser();
    const { searchParams } = new URL(request.url);
    const body = adminAvailabilityDeleteSchema.parse({ id: searchParams.get('id') });
    const result = await deleteDayOverride(body.id);
    return NextResponse.json({ data: result, error: null, meta: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: getErrorMessage(error, 'Unable to undo that day change.'), meta: null },
      { status: 400 },
    );
  }
}
