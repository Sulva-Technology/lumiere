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
    <Glass level="medium" className="max-w-4xl border border-[#6d4a13]/35 bg-[#1a1108] p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-[rgba(212,168,71,0.14)] p-3 text-[#D4A847]">
          <Mail size={20} />
        </div>
        <div>
          <h1 className="font-serif text-3xl text-[#F7E7C1]">Emails</h1>
          <p className="mt-2 text-sm text-white/60">Send manual emails from the admin. Use commas to send to multiple recipients.</p>
        </div>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <input
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white outline-none placeholder:text-white/30"
          placeholder="Recipient email, or comma-separated emails"
          required
        />
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white outline-none placeholder:text-white/30"
          placeholder="Subject"
          required
        />
        <input
          value={replyTo}
          onChange={(event) => setReplyTo(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white outline-none placeholder:text-white/30"
          placeholder="Reply-to email (optional)"
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-72 w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-white/30"
          placeholder="Write your message..."
          required
        />

        {error && <p className="text-sm text-red-300">{error}</p>}
        {success && <p className="text-sm text-emerald-300">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-[#8B6914] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send size={16} />
          {saving ? 'Sending...' : 'Send Email'}
        </button>
      </form>
    </Glass>
  );
}
