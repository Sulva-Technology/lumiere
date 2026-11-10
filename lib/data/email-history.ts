import { Resend } from 'resend';
import { getOptionalEnv } from '@/lib/env';
import { describeEmail, type EmailHistoryEntry } from '@/lib/email-history';

export async function getEmailHistory(after?: string) {
  const apiKey = getOptionalEnv('RESEND_API_KEY');
  if (!apiKey) throw new Error('Email delivery is not configured.');
  const { data, error } = await new Resend(apiKey).emails.list({ limit: 50, ...(after ? { after } : {}) });
  if (error) {
    console.error('Email provider history failed', error);
    throw new Error(error.name === 'restricted_api_key'
      ? 'Email history requires a Resend API key with full access. Update the server email configuration.'
      : 'Unable to load email history from the email provider. Please try again.');
  }
  if (!data) throw new Error('The email provider returned no history. Please try again.');
  const entries: EmailHistoryEntry[] = data.data.map((email) => ({
    ...describeEmail(email.subject),
    id: email.id,
    createdAt: email.created_at,
    recipients: email.to,
    subject: email.subject,
    status: email.last_event,
  }));
  return { entries, nextCursor: data.has_more ? entries.at(-1)?.id ?? null : null };
}
