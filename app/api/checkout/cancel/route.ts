import { NextRequest, NextResponse } from 'next/server';
import { markOrderCheckoutCancelled } from '@/lib/data/checkout';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order id.' }, { status: 400 });
    }

    await markOrderCheckoutCancelled(orderId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update checkout state.' }, { status: 400 });
  }
}
