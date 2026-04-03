import { NextRequest, NextResponse } from 'next/server';
import { markOrderCheckoutCancelled } from '@/lib/data/checkout';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';

    if (!orderId) {
      return NextResponse.json({ data: null, error: 'Missing order id.', meta: null }, { status: 400 });
    }

    await markOrderCheckoutCancelled(orderId);
    return NextResponse.json({ data: { ok: true }, error: null, meta: null });
  } catch {
    return NextResponse.json({ data: null, error: 'Unable to update checkout state.', meta: null }, { status: 400 });
  }
}
