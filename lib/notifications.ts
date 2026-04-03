import { Resend } from 'resend';
import { getOptionalEnv } from '@/lib/env';
import type { MakeupBookingIntake } from '@/lib/types';

type MailPayload = {
  to: string | string[];
  subject: string;
  html: string;
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
  fullName: string;
  email: string;
  bookingReference: string;
  serviceName: string;
  stylistName: string;
  startsAt: string;
  phone: string;
  notes?: string | null;
  makeupIntake?: MakeupBookingIntake | null;
};

type OrderStatusEmailPayload = {
  storeName: string;
  supportEmail: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  fulfillmentStatus: string;
};

const resendApiKey = getOptionalEnv('RESEND_API_KEY');
const resendFromEmail = getOptionalEnv('RESEND_FROM_EMAIL', 'hello@itzlolabeauty.com');

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
    timeStyle: 'short',
  }).format(new Date(value));
}

async function sendMail(payload: MailPayload) {
  if (!resend) {
    console.warn('Resend is not configured. Skipping email delivery.');
    return;
  }

  await resend.emails.send({
    from: resendFromEmail,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    replyTo: payload.replyTo,
  });
}

export async function sendOrderConfirmationEmails(payload: OrderEmailPayload) {
  const itemsMarkup = payload.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #2b1d0b;color:#f8f1dd;">${escapeHtml(item.productName)} <span style="color:#c7b38c;">(${escapeHtml(item.variantTitle)})</span></td>
          <td style="padding:12px 0;border-bottom:1px solid #2b1d0b;color:#c7b38c;text-align:center;">${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #2b1d0b;color:#f0d080;text-align:right;">${formatCurrency(item.lineTotal)}</td>
        </tr>
      `
    )
    .join('');

  const customerHtml = `
    <div style="background:#120b05;padding:32px;font-family:Georgia,serif;color:#f8f1dd;">
      <h1 style="margin:0 0 12px;font-size:32px;color:#f0d080;">${escapeHtml(payload.storeName)}</h1>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;color:#dbc8a6;">Your order is confirmed and we are preparing it now.</p>
      <div style="padding:20px;border:1px solid #6d4a13;border-radius:20px;background:#1a1108;">
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Hi ${escapeHtml(payload.customerName)},</p>
        <p style="margin:0 0 18px;font-family:Arial,sans-serif;color:#dbc8a6;">Thank you for shopping with us. Your order <strong>${escapeHtml(payload.orderNumber)}</strong> has been paid successfully.</p>
        <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;">
          <thead>
            <tr>
              <th style="padding-bottom:12px;text-align:left;color:#c7b38c;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Item</th>
              <th style="padding-bottom:12px;text-align:center;color:#c7b38c;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Qty</th>
              <th style="padding-bottom:12px;text-align:right;color:#c7b38c;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsMarkup}</tbody>
        </table>
        <div style="margin-top:18px;font-family:Arial,sans-serif;color:#dbc8a6;">
          <p style="margin:0 0 6px;">Subtotal: ${formatCurrency(payload.subtotal)}</p>
          <p style="margin:0 0 6px;">Shipping: ${formatCurrency(payload.shipping)}</p>
          <p style="margin:12px 0 0;font-size:18px;color:#f0d080;"><strong>Total: ${formatCurrency(payload.total)}</strong></p>
        </div>
      </div>
      <p style="margin:20px 0 0;font-family:Arial,sans-serif;color:#c7b38c;">Need help? Reply to this email or contact ${escapeHtml(payload.supportEmail)}.</p>
    </div>
  `;

  const internalHtml = `
    <div style="font-family:Arial,sans-serif;padding:24px;background:#fffaf1;color:#20160b;">
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
  const internalRecipient = payload.bookingContactEmail || payload.supportEmail;
  const makeupRows = payload.makeupIntake
    ? [
        ['Appointment Date & Time Needed', payload.makeupIntake.appointmentDateTimeNeeded],
        ['What is the occasion?', payload.makeupIntake.occasion],
        ['Reference / inspiration details', payload.makeupIntake.referenceDescription],
        ['Reference image', payload.makeupIntake.referenceImageUrl ?? 'No upload attached'],
        ['What type of look are you going for?', payload.makeupIntake.lookType],
        ['What is your skin type?', payload.makeupIntake.skinType],
        ['Skin conditions or allergies', payload.makeupIntake.skinConditionsOrAllergies],
        ['Will you need lashes included?', payload.makeupIntake.lashesPreference],
        ['Have you had your makeup done professionally before?', payload.makeupIntake.hadProfessionalMakeupBefore],
        ['If yes, anything you liked or didn’t like?', payload.makeupIntake.priorExperienceNotes ?? 'Not provided'],
        ['Any product preferences or restrictions?', payload.makeupIntake.productPreferencesOrRestrictions ?? 'Not provided'],
      ]
    : [];

  const makeupMarkup =
    makeupRows.length > 0
      ? `
        <div style="margin-top:18px;padding-top:18px;border-top:1px solid #e7dcc8;">
          <h3 style="margin:0 0 12px;font-size:16px;">Makeup intake</h3>
          ${makeupRows
            .map(
              ([label, value]) =>
                `<p style="margin:0 0 10px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
            )
            .join('')}
        </div>
      `
      : '';

  const customerHtml = `
    <div style="background:#120b05;padding:32px;font-family:Georgia,serif;color:#f8f1dd;">
      <h1 style="margin:0 0 12px;font-size:32px;color:#f0d080;">${escapeHtml(payload.storeName)}</h1>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;color:#dbc8a6;">Your appointment is confirmed.</p>
      <div style="padding:20px;border:1px solid #6d4a13;border-radius:20px;background:#1a1108;">
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Hi ${escapeHtml(payload.fullName)},</p>
        <p style="margin:0 0 18px;font-family:Arial,sans-serif;color:#dbc8a6;">Your booking <strong>${escapeHtml(payload.bookingReference)}</strong> is confirmed.</p>
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Service: ${escapeHtml(payload.serviceName)}</p>
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Artist: ${escapeHtml(payload.stylistName)}</p>
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Date: ${formatDateTime(payload.startsAt)}</p>
        <p style="margin:0;font-family:Arial,sans-serif;">Phone: ${escapeHtml(payload.phone)}</p>
      </div>
      <p style="margin:20px 0 0;font-family:Arial,sans-serif;color:#c7b38c;">Need to update your appointment? Reply to this email or contact ${escapeHtml(payload.bookingContactEmail)}.</p>
    </div>
  `;

  const internalHtml = `
    <div style="font-family:Arial,sans-serif;padding:24px;background:#fffaf1;color:#20160b;">
      <h2 style="margin-top:0;">New booking confirmed</h2>
      <p><strong>Reference:</strong> ${escapeHtml(payload.bookingReference)}</p>
      <p><strong>Client:</strong> ${escapeHtml(payload.fullName)} (${escapeHtml(payload.email)})</p>
      <p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>
      <p><strong>Service:</strong> ${escapeHtml(payload.serviceName)}</p>
      <p><strong>Artist:</strong> ${escapeHtml(payload.stylistName)}</p>
      <p><strong>Starts:</strong> ${formatDateTime(payload.startsAt)}</p>
      ${payload.notes ? `<p><strong>Notes:</strong> ${escapeHtml(payload.notes)}</p>` : ''}
      ${makeupMarkup}
    </div>
  `;

  await sendMail({
    to: payload.email,
    subject: `${payload.storeName} booking confirmation ${payload.bookingReference}`,
    html: customerHtml,
    replyTo: payload.bookingContactEmail || payload.supportEmail,
  });

  if (internalRecipient && internalRecipient !== payload.email) {
    await sendMail({
      to: internalRecipient,
      subject: `New booking confirmed: ${payload.bookingReference}`,
      html: internalHtml,
      replyTo: payload.email,
    });
  }
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
    <div style="background:#120b05;padding:32px;font-family:Georgia,serif;color:#f8f1dd;">
      <h1 style="margin:0 0 12px;font-size:32px;color:#f0d080;">${escapeHtml(payload.storeName)}</h1>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;color:#dbc8a6;">Your order status has changed.</p>
      <div style="padding:20px;border:1px solid #6d4a13;border-radius:20px;background:#1a1108;">
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;">Hi ${escapeHtml(payload.customerName)},</p>
        <p style="margin:0 0 12px;font-family:Arial,sans-serif;color:#dbc8a6;">Order <strong>${escapeHtml(payload.orderNumber)}</strong> ${statusLabel}.</p>
        <p style="margin:0;font-family:Arial,sans-serif;color:#f0d080;text-transform:uppercase;letter-spacing:0.14em;">${payload.fulfillmentStatus}</p>
      </div>
      <p style="margin:20px 0 0;font-family:Arial,sans-serif;color:#c7b38c;">Questions? Reply to this email or contact ${escapeHtml(payload.supportEmail)}.</p>
    </div>
  `;

  await sendMail({
    to: payload.customerEmail,
    subject: `${payload.storeName} order update ${payload.orderNumber}`,
    html: customerHtml,
    replyTo: payload.supportEmail,
  });
}
