import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { adminAvailabilityDeleteSchema, adminAvailabilityRuleSchema } from '@/lib/schemas';
import { deleteAvailabilityRule, getAvailabilityRules, upsertAvailabilityRule } from '@/lib/data/availability';
import { getErrorMessage } from '@/lib/validation';

export async function GET() {
  try {
    await requireAdminApiUser();
    const rules = await getAvailabilityRules();
    return NextResponse.json({ data: { rules }, error: null, meta: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: getErrorMessage(error, 'Unable to load recurring availability.'), meta: null }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApiUser();
    const body = adminAvailabilityRuleSchema.parse(await request.json());
    const rule = await upsertAvailabilityRule(body);
    return NextResponse.json({ data: { rule }, error: null, meta: null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ data: null, error: getErrorMessage(error, 'Unable to save recurring availability.'), meta: null }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminApiUser();
    const body = adminAvailabilityRuleSchema.parse(await request.json());
    if (!body.id) {
      return NextResponse.json({ data: null, error: 'Rule id is required.', meta: null }, { status: 400 });
    }
    const rule = await upsertAvailabilityRule(body);
    return NextResponse.json({ data: { rule }, error: null, meta: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: getErrorMessage(error, 'Unable to update recurring availability.'), meta: null }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminApiUser();
    const { searchParams } = new URL(request.url);
    const body = adminAvailabilityDeleteSchema.parse({ id: searchParams.get('id') });
    await deleteAvailabilityRule(body.id);
    return NextResponse.json({ data: { success: true }, error: null, meta: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: getErrorMessage(error, 'Unable to remove recurring availability.'), meta: null }, { status: 400 });
  }
}
