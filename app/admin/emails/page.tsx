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
    <Glass level="medium" className="max-w-5xl border border-[rgba(154,177,143,0.16)] bg-[rgba(22,33,26,0.9)] p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-full border border-[rgba(154,177,143,0.18)] bg-[rgba(108,139,103,0.16)] p-3 text-[#d7e0d0]">
            <Mail size={20} />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-[#eef2ea]">Emails</h1>
            <p className="mt-2 max-w-xl text-sm text-[#d7e0d0]/72">Send manual emails from the admin. Use commas to send to multiple recipients.</p>
          </div>
        </div>
        <div className="rounded-3xl border border-[rgba(154,177,143,0.14)] bg-[rgba(108,139,103,0.1)] px-4 py-3 text-sm text-[#d7e0d0]/75">
          Best for direct outreach, follow-ups, and one-off support replies.
        </div>
      </div>

      <form className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.24em] text-[#9ab18f]/72">Recipients</label>
            <input
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-full rounded-2xl border border-[rgba(154,177,143,0.16)] bg-[rgba(108,139,103,0.08)] px-5 py-3 text-[#eef2ea] outline-none placeholder:text-[#d7e0d0]/35"
              placeholder="Recipient email, or comma-separated emails"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.24em] text-[#9ab18f]/72">Subject</label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-2xl border border-[rgba(154,177,143,0.16)] bg-[rgba(108,139,103,0.08)] px-5 py-3 text-[#eef2ea] outline-none placeholder:text-[#d7e0d0]/35"
              placeholder="Subject"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.24em] text-[#9ab18f]/72">Reply-To</label>
            <input
              value={replyTo}
              onChange={(event) => setReplyTo(event.target.value)}
              className="w-full rounded-2xl border border-[rgba(154,177,143,0.16)] bg-[rgba(108,139,103,0.08)] px-5 py-3 text-[#eef2ea] outline-none placeholder:text-[#d7e0d0]/35"
              placeholder="Reply-to email (optional)"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-[0.24em] text-[#9ab18f]/72">Message</label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-72 w-full rounded-3xl border border-[rgba(154,177,143,0.16)] bg-[rgba(108,139,103,0.08)] px-5 py-4 text-[#eef2ea] outline-none placeholder:text-[#d7e0d0]/35"
            placeholder="Write your message..."
            required
          />
        </div>

        <div className="lg:col-span-2">
          {error && <p className="text-sm text-red-300">{error}</p>}
          {success && <p className="text-sm text-emerald-300">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(154,177,143,0.18)] bg-[linear-gradient(135deg,rgba(108,139,103,0.72),rgba(58,77,57,0.96))] px-6 py-3 font-medium text-[#eef2ea] shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-all hover:translate-y-[-1px] hover:opacity-95 disabled:opacity-50"
          >
            <Send size={16} />
            {saving ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>
    </Glass>
  );
}
