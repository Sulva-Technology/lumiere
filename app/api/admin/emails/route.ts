import { NextRequest, NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { sendAdminEmail } from '@/lib/data/admin';
import { adminEmailSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    await requireAdminApiUser();
    const body = adminEmailSchema.parse(await request.json());
    const recipients = body.to
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      throw new Error('Add at least one recipient email.');
    }

    await sendAdminEmail({
      to: recipients,
      subject: body.subject,
      message: body.message,
      replyTo: body.replyTo || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to send email.' }, { status: 400 });
  }
}
