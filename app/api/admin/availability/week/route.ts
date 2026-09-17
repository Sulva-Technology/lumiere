import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { adminAvailabilityWeekSchema } from '@/lib/schemas';
import { saveWeeklyHours } from '@/lib/data/availability';
import { getErrorMessage } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    await requireAdminApiUser();
    const body = adminAvailabilityWeekSchema.parse(await request.json());
    const result = await saveWeeklyHours(body);
    return NextResponse.json({ data: result, error: null, meta: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: getErrorMessage(error, 'Unable to save your working week.'), meta: null },
      { status: 400 },
    );
  }
}
