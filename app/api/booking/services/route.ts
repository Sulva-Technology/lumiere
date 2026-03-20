import { NextResponse } from 'next/server';
import { getBookingServices } from '@/lib/data/public';

export async function GET() {
  try {
    const services = await getBookingServices();
    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load booking services.' }, { status: 500 });
  }
}

