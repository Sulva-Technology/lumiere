import { NextRequest, NextResponse } from 'next/server';

import { getPublicStoreSettings } from '@/lib/data/public';
import { sendContactInquiryEmails } from '@/lib/notifications';
import { checkRateLimit } from '@/lib/rate-limit';
import { contactInquirySchema } from '@/lib/schemas';
import { assertTrustedOrigin, getClientIp } from '@/lib/security';
import { getErrorMessage } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`contact:${ip}`, 6, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ data: null, error: 'Too many inquiry attempts. Please wait a moment and try again.', meta: null }, { status: 429 });
  }

  try {
    assertTrustedOrigin(request);
    const body = contactInquirySchema.parse(await request.json());
    const store = await getPublicStoreSettings();

    await sendContactInquiryEmails({
      storeName: store.storeName,
      supportEmail: store.supportEmail,
      bookingContactEmail: store.bookingContactEmail,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      eventDate: body.eventDate ?? null,
      serviceInterest: body.serviceInterest,
      location: body.location,
      message: body.message,
    });

    return NextResponse.json({ data: { ok: true }, error: null, meta: null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ data: null, error: getErrorMessage(error, 'Unable to send your inquiry right now.'), meta: null }, { status: 400 });
  }
}
