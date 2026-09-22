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
    console.error("API ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

