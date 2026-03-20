import { NextResponse } from 'next/server';
import { getAvailability } from '@/lib/data/public';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stylistId = searchParams.get('stylistId') ?? undefined;
    const serviceId = searchParams.get('serviceId') ?? undefined;
    const availability = await getAvailability(stylistId, serviceId);
    return NextResponse.json({ availability });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load availability.' }, { status: 500 });
  }
}

