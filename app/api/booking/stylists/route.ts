import { NextResponse } from 'next/server';
import { getStylists } from '@/lib/data/public';

export async function GET() {
  try {
    const stylists = await getStylists();
    return NextResponse.json({ stylists });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load stylists.' }, { status: 500 });
  }
}

