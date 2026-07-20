import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { createAvailabilitySchedule } from '@/lib/data/availability';
import { adminAvailabilityScheduleSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    await requireAdminApiUser();
    const body = adminAvailabilityScheduleSchema.parse(await request.json());
    const result = await createAvailabilitySchedule(body);
    return NextResponse.json({ data: result, error: null, meta: null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ data: null, error: getErrorMessage(error, 'Unable to create the availability schedule.'), meta: null }, { status: 400 });
  }
}
