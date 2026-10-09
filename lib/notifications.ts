import { Resend } from 'resend';
import { getOptionalEnv } from '@/lib/env';
import type { MakeupBookingIntake } from '@/lib/types';
import { BUSINESS_TIME_ZONE } from '@/lib/timezone';
import { downloadUrl } from '@/lib/download-url';

type MailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

type AdminCustomEmailPayload = {
  to: string | string[];
  subject: string;
  message: string;
  replyTo?: string;
};

type OrderEmailPayload = {
  storeName: string;
  supportEmail: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: Array<{
    productName: string;
    variantTitle: string;
    quantity: number;
    lineTotal: number;
  }>;
};

type BookingEmailPayload = {
  storeName: string;
  supportEmail: string;
  bookingContactEmail: string;
  stylistEmail?: string | null;
  fullName: string;
  email: string;
  bookingReference: string;
  serviceName: string;
  stylistName: string;
  startsAt: string;
  phone: string;
  notes?: string | null;
  makeupIntake?: MakeupBookingIntake | null;
  payment?: BookingPaymentSummary | null;
};

/** Money for the appointment, as saved on the booking's payment at checkout. */
export type BookingPaymentSummary = {
  inPerson: boolean;
  depositAmount: number | null;
  appointmentTotal: number | null;
  balanceDue: number | null;
  sameDayFee: number | null;
  specialLabel: string | null;
};

/** Read the booking money saved on a payment's checkout metadata. */
export function bookingPaymentSummary(
  payment: { amount?: unknown; metadata?: unknown } | null | undefined,
  inPerson: boolean,
): BookingPaymentSummary {
  const meta = (payment?.metadata && typeof payment.metadata === 'object' ? payment.metadata : {}) as Record<string, unknown>;
  const num = (value: unknown) =>
    value === null || value === undefined || value === '' || Number.isNaN(Number(value)) ? null : Number(value);
  return {
    inPerson,
    depositAmount: num(meta.retainerAmount) ?? num(payment?.amount),
    appointmentTotal: num(meta.appointmentTotal),
    balanceDue: num(meta.remainingBalance),
    sameDayFee: num(meta.sameDayFee),
    specialLabel: typeof meta.specialLabel === 'string' && meta.specialLabel.trim() ? meta.specialLabel : null,
  };
}

/** The intake answers saved on a payment's checkout metadata, for databases without an intake column. */
export function bookingPaymentIntake(payment: { metadata?: unknown } | null | undefined): MakeupBookingIntake | null {
  const meta = payment?.metadata && typeof payment.metadata === 'object' ? (payment.metadata as Record<string, unknown>) : null;
  const intake = meta?.makeupIntake;
  return intake && typeof intake === 'object' && !Array.isArray(intake) && Object.keys(intake).length > 0
    ? (intake as MakeupBookingIntake)
    : null;
}

type OrderStatusEmailPayload = {
  storeName: string;
  supportEmail: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  fulfillmentStatus: string;
};

const resendApiKey = getOptionalEnv('RESEND_API_KEY');
const resendFromAddress = getOptionalEnv('RESEND_FROM_EMAIL', 'hello@itzlolabeauty.com');
// A bare address shows its mailbox ("orders") as the sender in inboxes, so give it the brand name.
const resendFromEmail = resendFromAddress.includes('<')
  ? resendFromAddress
  : `${getOptionalEnv('RESEND_FROM_NAME').trim() || 'Itz Lola Beauty'} <${resendFromAddress}>`;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: BUSINESS_TIME_ZONE,
  }).format(new Date(value));
}

async function sendMail(payload: MailPayload) {
  if (!resend) {
    console.warn('Resend is not configured. Skipping email delivery.');
    return;
  }

  // Resend reports failures (unverified domain, bad recipient) in `error` instead of throwing.
  const { error } = await resend.emails.send({
    from: resendFromEmail,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    replyTo: payload.replyTo,
  });
  if (error) {
    throw new Error(`Email to ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to} failed: ${error.message}`);
  }
}

export async function sendAdminCustomEmail(payload: AdminCustomEmailPayload) {
  const html = `
    <div style="background:#140d05;padding:32px;font-family:Arial,sans-serif;color:#F7E7C1;">
      <div style="border:1px solid rgba(201,147,97,0.22);border-radius:20px;background:#1f1208;padding:24px;">
        <p style="margin:0;white-space:pre-wrap;line-height:1.7;">${escapeHtml(payload.message)}</p>
      </div>
    </div>
  `;

  await sendMail({
    to: payload.to,
    subject: payload.subject,
    html,
    replyTo: payload.replyTo,
  });
}

export async function sendOrderConfirmationEmails(payload: OrderEmailPayload) {
  const itemsMarkup = payload.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid rgba(201,147,97,0.14);color:#F7E7C1;">${escapeHtml(item.productName)} <span style="color:#c9b9a6;">(${escapeHtml(item.variantTitle)})</span></td>
          <td style="padding:12px 0;border-bottom:1px solid rgba(201,147,97,0.14);color:#c9b9a6;text-align:center;">${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid rgba(201,147,97,0.14);color:#e8d3bd;text-align:right;">${formatCurrency(item.lineTotal)}</td>
        </tr>
      `
    )
    .join('');

  const customerHtml = `
    <div style="background:#140d05;padding:32px;font-family:Georgia,serif;color:#F7E7C1;">
      <h1 style="margin:0 0 12px;font-size:32px;color:#F7E7C1;">${escapeHtml(payload.storeName)}</h1>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;color:#e0d2c0;">Your order is confirmed and we are preparing it now.</p>
      <div style="padding:20px;border:1px solid rgba(201,147,97,0.2);border-radius:20px;background:#1f1208;">
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Hi ${escapeHtml(payload.customerName)},</p>
        <p style="margin:0 0 18px;font-family:Arial,sans-serif;color:#e0d2c0;">Thank you for shopping with us. Your order <strong>${escapeHtml(payload.orderNumber)}</strong> has been paid successfully.</p>
        <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;">
          <thead>
            <tr>
              <th style="padding-bottom:12px;text-align:left;color:#c99361;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Item</th>
              <th style="padding-bottom:12px;text-align:center;color:#c99361;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Qty</th>
              <th style="padding-bottom:12px;text-align:right;color:#c99361;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsMarkup}</tbody>
        </table>
        <div style="margin-top:18px;font-family:Arial,sans-serif;color:#e0d2c0;">
          <p style="margin:0 0 6px;">Subtotal: ${formatCurrency(payload.subtotal)}</p>
          <p style="margin:0 0 6px;">Shipping: ${formatCurrency(payload.shipping)}</p>
          <p style="margin:12px 0 0;font-size:18px;color:#F7E7C1;"><strong>Total: ${formatCurrency(payload.total)}</strong></p>
        </div>
      </div>
      <p style="margin:20px 0 0;font-family:Arial,sans-serif;color:#c99361;">Need help? Reply to this email or contact ${escapeHtml(payload.supportEmail)}.</p>
    </div>
  `;

  const internalHtml = `
    <div style="font-family:Arial,sans-serif;padding:24px;background:#F7E7C1;color:#3a1c08;">
      <h2 style="margin-top:0;">New paid order</h2>
      <p><strong>Order:</strong> ${escapeHtml(payload.orderNumber)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(payload.customerName)} (${escapeHtml(payload.customerEmail)})</p>
      <p><strong>Total:</strong> ${formatCurrency(payload.total)}</p>
    </div>
  `;

  await sendMail({
    to: payload.customerEmail,
    subject: `${payload.storeName} order confirmation ${payload.orderNumber}`,
    html: customerHtml,
    replyTo: payload.supportEmail,
  });

  if (payload.supportEmail && payload.supportEmail !== payload.customerEmail) {
    await sendMail({
      to: payload.supportEmail,
      subject: `New paid order: ${payload.orderNumber}`,
      html: internalHtml,
      replyTo: payload.customerEmail,
    });
  }
}

export async function sendBookingConfirmationEmails(payload: BookingEmailPayload) {
  const internalRecipients = Array.from(
    new Set([payload.stylistEmail, payload.bookingContactEmail, payload.supportEmail].filter(Boolean))
  ).filter((recipient): recipient is string => Boolean(recipient) && recipient !== payload.email);
  const intake = payload.makeupIntake;
  // Only questions the client actually answered, so the artist never reads a made-up answer.
  const makeupRows = (
    intake
      ? [
          ['Appointment Date & Time Needed', intake.appointmentDateTimeNeeded],
          ['What is the occasion?', intake.occasion],
          ['Reference / inspiration details', intake.referenceDescription],
          ['What type of look are you going for?', intake.lookType],
          ['What is your skin type?', intake.skinType],
          ['Skin conditions or allergies', intake.skinConditionsOrAllergies],
          ['Will you need lashes included?', intake.lashesPreference],
          ['Have you had your makeup done professionally before?', intake.hadProfessionalMakeupBefore],
          ["If yes, anything you liked or didn't like?", intake.priorExperienceNotes],
          ['Any product preferences or restrictions?', intake.productPreferencesOrRestrictions],
        ]
      : []
  ).filter((row): row is [string, string] => typeof row[1] === 'string' && row[1].trim().length > 0);

  const referenceImageUrl = intake?.referenceImageUrl?.trim() || null;
  const referenceImageMarkup = referenceImageUrl
    ? (() => {
        const download = escapeHtml(downloadUrl(referenceImageUrl, `${payload.bookingReference}-reference`));
        return `
          <p style="margin:0 0 8px;"><strong>Reference image:</strong></p>
          <a href="${download}" style="display:inline-block;margin:0 0 8px;">
            <img src="${escapeHtml(referenceImageUrl)}" alt="Reference look from ${escapeHtml(payload.fullName)}" width="180" style="display:block;max-width:180px;height:auto;border-radius:12px;border:0;" />
          </a>
          <p style="margin:0 0 10px;"><a href="${download}" style="color:inherit;font-weight:bold;text-decoration:underline;">Download image</a></p>
        `;
      })()
    : '';

  const makeupMarkup =
    makeupRows.length > 0 || referenceImageMarkup
      ? (heading: string) => `
        <div style="margin-top:18px;padding-top:18px;border-top:1px solid rgba(201,147,97,0.18);">
          <h3 style="margin:0 0 12px;font-size:16px;">${heading}</h3>
          ${makeupRows
            .map(
              ([label, value]) =>
                `<p style="margin:0 0 10px;"><strong>${escapeHtml(label)}${label.endsWith('?') ? '' : ':'}</strong> ${escapeHtml(value)}</p>`
            )
            .join('')}
          ${referenceImageMarkup}
        </div>
      `
      : () => '';

  const payment = payload.payment;
  const money = (amount: number | null | undefined) => (typeof amount === 'number' ? formatCurrency(amount) : null);
  const paymentRows = payment
    ? [
        ['Payment method', payment.inPerson ? 'Paying in person at the appointment' : 'Deposit paid online'],
        ['Appointment total', money(payment.appointmentTotal)],
        [payment.inPerson ? 'Deposit (not yet paid)' : 'Deposit paid', money(payment.depositAmount)],
        ['Balance due at appointment', money(payment.inPerson ? payment.appointmentTotal : payment.balanceDue)],
        ['Same-day fee', payment.sameDayFee ? money(payment.sameDayFee) : null],
        ['Special applied', payment.specialLabel],
      ].filter((row): row is [string, string] => Boolean(row[1]))
    : [];
  const paymentMarkup =
    paymentRows.length > 0
      ? `
        <div style="margin-top:18px;padding-top:18px;border-top:1px solid rgba(201,147,97,0.18);">
          <h3 style="margin:0 0 12px;font-size:16px;">Payment</h3>
          ${paymentRows
            .map(([label, value]) => `<p style="margin:0 0 10px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`)
            .join('')}
        </div>
      `
      : '';
  const notesMarkup = `<p style="margin:0 0 8px;"><strong>Notes:</strong> ${payload.notes ? escapeHtml(payload.notes) : 'None'}</p>`;
  const customerPaymentLine = payment?.inPerson
    ? 'Your appointment is confirmed. Payment is due in person at your appointment.'
    : 'Your appointment is confirmed. Your deposit has been received; the remaining balance is due at your appointment.';

  const customerHtml = `
    <div style="background:#140d05;padding:32px;font-family:Georgia,serif;color:#F7E7C1;">
      <h1 style="margin:0 0 12px;font-size:32px;color:#F7E7C1;">${escapeHtml(payload.storeName)}</h1>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;color:#e0d2c0;">${customerPaymentLine}</p>
      <div style="padding:20px;border:1px solid rgba(201,147,97,0.2);border-radius:20px;background:#1f1208;">
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Hi ${escapeHtml(payload.fullName)},</p>
        <p style="margin:0 0 18px;font-family:Arial,sans-serif;color:#e0d2c0;">Your booking <strong>${escapeHtml(payload.bookingReference)}</strong> is confirmed.</p>
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Service: ${escapeHtml(payload.serviceName)}</p>
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Artist: ${escapeHtml(payload.stylistName)}</p>
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Date: ${formatDateTime(payload.startsAt)}</p>
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Phone: ${escapeHtml(payload.phone)}</p>
        <div style="font-family:Arial,sans-serif;">
          ${notesMarkup}
          ${paymentMarkup}
          ${makeupMarkup('Your appointment details')}
        </div>
      </div>
      <p style="margin:20px 0 0;font-family:Arial,sans-serif;color:#c99361;">Need to update your appointment? Reply to this email or contact ${escapeHtml(payload.bookingContactEmail)}.</p>
    </div>
  `;

  const internalHtml = `
    <div style="font-family:Arial,sans-serif;padding:24px;background:#F7E7C1;color:#3a1c08;">
      <h2 style="margin-top:0;">New booking confirmed</h2>
      <p><strong>Reference:</strong> ${escapeHtml(payload.bookingReference)}</p>
      <p><strong>Client:</strong> ${escapeHtml(payload.fullName)} (${escapeHtml(payload.email)})</p>
      <p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>
      <p><strong>Service:</strong> ${escapeHtml(payload.serviceName)}</p>
      <p><strong>Artist:</strong> ${escapeHtml(payload.stylistName)}</p>
      <p><strong>Starts:</strong> ${formatDateTime(payload.startsAt)}</p>
      ${notesMarkup}
      ${paymentMarkup}
      ${makeupMarkup('Makeup intake')}
    </div>
  `;

  // Send both independently so one failed address never blocks the other email.
  const results = await Promise.allSettled([
    sendMail({
      to: payload.email,
      subject: `${payload.storeName} booking confirmation ${payload.bookingReference}`,
      html: customerHtml,
      replyTo: payload.bookingContactEmail || payload.supportEmail,
    }),
    internalRecipients.length > 0
      ? sendMail({
          to: internalRecipients,
          subject: `New booking confirmed: ${payload.bookingReference}`,
          html: internalHtml,
          replyTo: payload.email,
        })
      : Promise.resolve(),
  ]);
  const failures = results.flatMap((result) => (result.status === 'rejected' ? [String(result.reason instanceof Error ? result.reason.message : result.reason)] : []));
  if (failures.length > 0) throw new Error(failures.join(' | '));
  return { client: payload.email, team: internalRecipients };
}

export async function sendOrderStatusUpdateEmail(payload: OrderStatusEmailPayload) {
  const statusLabel =
    payload.fulfillmentStatus === 'processing'
      ? 'is now being prepared'
      : payload.fulfillmentStatus === 'shipped'
        ? 'has been shipped'
        : payload.fulfillmentStatus === 'delivered'
          ? 'has been delivered'
          : 'has been updated';

  const customerHtml = `
    <div style="background:#140d05;padding:32px;font-family:Georgia,serif;color:#F7E7C1;">
      <h1 style="margin:0 0 12px;font-size:32px;color:#F7E7C1;">${escapeHtml(payload.storeName)}</h1>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;color:#e0d2c0;">Your order status has changed.</p>
      <div style="padding:20px;border:1px solid rgba(201,147,97,0.2);border-radius:20px;background:#1f1208;">
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Hi ${escapeHtml(payload.customerName)},</p>
        <p style="margin:0 0 12px;font-family:Arial,sans-serif;color:#e0d2c0;">Order <strong>${escapeHtml(payload.orderNumber)}</strong> ${statusLabel}.</p>
        <p style="margin:0;font-family:Arial,sans-serif;color:#c99361;text-transform:uppercase;letter-spacing:0.14em;">${payload.fulfillmentStatus}</p>
      </div>
      <p style="margin:20px 0 0;font-family:Arial,sans-serif;color:#c99361;">Questions? Reply to this email or contact ${escapeHtml(payload.supportEmail)}.</p>
    </div>
  `;

  await sendMail({
    to: payload.customerEmail,
    subject: `${payload.storeName} order update ${payload.orderNumber}`,
    html: customerHtml,
    replyTo: payload.supportEmail,
  });
}

