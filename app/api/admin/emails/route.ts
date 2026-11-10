import { NextRequest, NextResponse } from 'next/server';

import { requireAdminApiUser } from '@/lib/auth';
import { sendAdminEmail } from '@/lib/data/admin';
import { adminEmailSchema } from '@/lib/schemas';
import { getEmailHistory } from '@/lib/data/email-history';

export async function GET(request: NextRequest) {
  try {
    await requireAdminApiUser();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: message === 'Forbidden' ? 403 : 401 });
  }

  const after = request.nextUrl.searchParams.get('after') || undefined;
  if (after && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(after)) {
    return NextResponse.json({ error: 'Invalid email history cursor.' }, { status: 400 });
  }
  try {
    return NextResponse.json(await getEmailHistory(after), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Email history read failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load email history. Please try again.' }, { status: 500 });
  }
}

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
