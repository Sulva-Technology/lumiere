import { NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { resendBookingConfirmationEmail } from '@/lib/data/admin';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminApiUser();
    const { id } = await params;
    const sent = await resendBookingConfirmationEmail(id);
    return NextResponse.json({ ok: true, sent });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to resend booking email.' }, { status: 400 });
  }
}
