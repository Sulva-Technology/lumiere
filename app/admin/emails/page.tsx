'use client';

import { useEffect, useState } from 'react';
import { Mail, Send } from 'lucide-react';

import { Glass } from '@/components/ui/glass';
import { emailKindLabels, emailStatusLabels, type EmailHistoryEntry } from '@/lib/email-history';
import { formatDateTime } from '@/lib/format';

export default function AdminEmailsPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);

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
      setHistoryVersion((version) => version + 1);
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
            <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">Track booking, rescheduling, order, and manual emails in one place.</p>
          </div>
        </div>
        <div className="rounded-3xl bg-white/10 px-4 py-3 text-sm text-[var(--text-secondary)]">
          Best for direct outreach, follow-ups, and one-off support replies.
        </div>
      </div>

      <details className="mt-6 rounded-2xl border border-[#8B4411]/20 p-4">
        <summary className="cursor-pointer font-medium text-[#713813]">Compose an email</summary>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">Use commas to send to multiple recipients.</p>
      <form className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]" onSubmit={handleSubmit}>
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
      </details>
      <EmailHistory key={historyVersion} />
    </Glass>
  );
}

function EmailHistory() {
  const [entries, setEntries] = useState<EmailHistoryEntry[]>([]);
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [cursors, setCursors] = useState(['']);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const after = cursors[cursors.length - 1];
  const visibleEntries = entries.filter((entry) => (!kind || entry.kind === kind) && (!status || entry.status === status));

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ after });
        const response = await fetch(`/api/admin/emails?${params}`, { cache: 'no-store', signal: controller.signal });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load email history.');
        if (!controller.signal.aborted) {
          setEntries(json.entries);
          setNextCursor(json.nextCursor);
        }
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Unable to load email history.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [after, refresh]);

  return (
    <section className="mt-8" aria-labelledby="email-history-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="email-history-heading" className="font-serif text-2xl text-[#4A2109]">Email history</h2>
        <button type="button" disabled={loading} onClick={() => { setCursors(['']); setRefresh((value) => value + 1); }} className="rounded-full border border-[#8B4411]/30 px-4 py-2 text-sm text-[#713813] disabled:opacity-50">Refresh</button>
      </div>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Recent emails from your email provider, including previously sent messages. Sent means accepted for delivery; delivery updates appear when available.</p>
      <div className="my-5 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm text-[#713813]">
          Email type on this page
          <select value={kind} onChange={(event) => setKind(event.target.value)} className="rounded-xl bg-white/60 px-3 py-2">
            <option value="">All email types</option>
            {Object.entries(emailKindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[#713813]">
          Status on this page
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl bg-white/60 px-3 py-2">
            <option value="">All statuses</option>
            {Object.entries(emailStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      <div aria-live="polite" aria-busy={loading}>
        {loading ? <p className="py-6 text-sm text-[var(--text-secondary)]">Loading email history...</p>
          : error ? <p role="alert" className="py-6 text-sm text-red-700">{error}</p>
          : visibleEntries.length === 0 ? <p className="py-6 text-sm text-[var(--text-secondary)]">{kind || status ? 'No emails on this page match these filters. Try another page or clear the filters.' : 'No emails found in the available provider history.'}</p>
          : <ul className="space-y-3">
            {visibleEntries.map((entry) => (
              <li key={entry.id} className="rounded-2xl border border-[#8B4411]/15 bg-white/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[#713813]">{emailKindLabels[entry.kind] ?? 'Email'}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${['failed', 'bounced', 'complained'].includes(entry.status) ? 'bg-red-100 text-red-800' : ['queued', 'scheduled', 'delivery_delayed', 'canceled'].includes(entry.status) ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-800'}`}>{emailStatusLabels[entry.status] ?? entry.status}</span>
                </div>
                <h3 className="mt-2 break-words font-medium text-[#4A2109]">{entry.subject}</h3>
                <p className="mt-1 break-words text-sm text-[var(--text-secondary)]">{entry.description}</p>
                <p className="mt-2 break-all text-sm text-[#713813]">To: {entry.recipients.join(', ')}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                  <time dateTime={entry.createdAt}>{formatDateTime(entry.createdAt)}</time>
                  {entry.reference && <span>Reference: {entry.reference}</span>}
                </div>
              </li>
            ))}
          </ul>}
      </div>
      {!loading && !error && (cursors.length > 1 || nextCursor) && <nav aria-label="Email history pages" className="mt-5 flex items-center gap-4 text-sm text-[#713813]">
        <button type="button" disabled={cursors.length === 1} onClick={() => setCursors((value) => value.slice(0, -1))} className="rounded-full border border-[#8B4411]/30 px-4 py-2 disabled:opacity-40">Previous</button>
        <span>Page {cursors.length}</span>
        <button type="button" disabled={!nextCursor} onClick={() => { if (nextCursor) setCursors((value) => [...value, nextCursor]); }} className="rounded-full border border-[#8B4411]/30 px-4 py-2 disabled:opacity-40">Next</button>
      </nav>}
    </section>
  );
}
