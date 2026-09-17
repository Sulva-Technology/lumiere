'use client';

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

import { Glass } from '@/components/ui/glass';

export default function AdminEmailsPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          message,
          replyTo,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to send email.');

      setSuccess('Email sent.');
      setSubject('');
      setMessage('');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Unable to send email.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Glass level="medium" className="max-w-5xl p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-[rgba(139,68,17,0.12)] p-3 text-[#713813]">
            <Mail size={20} />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-[#4A2109]">Emails</h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">Send manual emails from the admin. Use commas to send to multiple recipients.</p>
          </div>
        </div>
        <div className="rounded-3xl bg-white/10 px-4 py-3 text-sm text-[var(--text-secondary)]">
          Best for direct outreach, follow-ups, and one-off support replies.
        </div>
      </div>

      <form className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75">Recipients</label>
            <input
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-full rounded-2xl bg-white/40 px-5 py-3 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]/70"
              placeholder="Recipient email, or comma-separated emails"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75">Subject</label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-2xl bg-white/40 px-5 py-3 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]/70"
              placeholder="Subject"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75">Reply-To</label>
            <input
              value={replyTo}
              onChange={(event) => setReplyTo(event.target.value)}
              className="w-full rounded-2xl bg-white/40 px-5 py-3 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]/70"
              placeholder="Reply-to email (optional)"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75">Message</label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-72 w-full rounded-3xl bg-white/40 px-5 py-4 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]/70"
            placeholder="Write your message..."
            required
          />
        </div>

        <div className="lg:col-span-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-[#8B4411]">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#8B4411] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send size={16} />
            {saving ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>
    </Glass>
  );
}
