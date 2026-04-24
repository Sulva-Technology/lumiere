'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle, Send } from 'lucide-react';

import { inquiryServiceOptions } from '@/lib/marketing-content';
import { cn } from '@/lib/utils';

type InquiryStatus = 'idle' | 'submitting' | 'success' | 'error';

type ContactInquiryFormProps = {
  className?: string;
  defaultServiceInterest?: string;
};

const fieldClassName =
  'w-full rounded-[20px] border border-border-soft bg-white/80 px-4 py-3 text-[15px] text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-accent-gold/50 focus:shadow-[0_0_0_4px_rgba(139,105,20,0.12)] dark:border-white/10 dark:bg-white/5 dark:placeholder:text-white/40';

export function ContactInquiryForm({ className, defaultServiceInterest }: ContactInquiryFormProps) {
  const resolvedInitialService = defaultServiceInterest?.trim() || 'General Inquiry';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [serviceInterest, setServiceInterest] = useState(resolvedInitialService);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<InquiryStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setServiceInterest(resolvedInitialService);
  }, [resolvedInitialService]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setFeedback(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          eventDate: eventDate || null,
          serviceInterest,
          location,
          message,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? 'Unable to send your inquiry right now.');
      }

      setStatus('success');
      setFeedback('Your inquiry is in. Expect a reply with next steps as soon as possible.');
      setFullName('');
      setEmail('');
      setPhone('');
      setEventDate('');
      setLocation('');
      setMessage('');
      setServiceInterest(resolvedInitialService);
    } catch (error) {
      setStatus('error');
      setFeedback(error instanceof Error ? error.message : 'Unable to send your inquiry right now.');
    }
  }

  return (
    <form className={cn('space-y-4', className)} onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="inquiry-name" className="text-xs font-semibold uppercase tracking-[0.26em] text-text-secondary">
            Name
          </label>
          <input id="inquiry-name" value={fullName} onChange={(event) => setFullName(event.target.value)} className={fieldClassName} placeholder="Your full name" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="inquiry-email" className="text-xs font-semibold uppercase tracking-[0.26em] text-text-secondary">
            Email
          </label>
          <input id="inquiry-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClassName} placeholder="you@example.com" required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="inquiry-phone" className="text-xs font-semibold uppercase tracking-[0.26em] text-text-secondary">
            Phone
          </label>
          <input id="inquiry-phone" value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClassName} placeholder="Best number to reach you" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="inquiry-date" className="text-xs font-semibold uppercase tracking-[0.26em] text-text-secondary">
            Event date
          </label>
          <input id="inquiry-date" type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} className={fieldClassName} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="inquiry-service" className="text-xs font-semibold uppercase tracking-[0.26em] text-text-secondary">
            Service interested in
          </label>
          <select id="inquiry-service" value={serviceInterest} onChange={(event) => setServiceInterest(event.target.value)} className={fieldClassName} required>
            {inquiryServiceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="inquiry-location" className="text-xs font-semibold uppercase tracking-[0.26em] text-text-secondary">
            Location
          </label>
          <input id="inquiry-location" value={location} onChange={(event) => setLocation(event.target.value)} className={fieldClassName} placeholder="City, venue, or service location" required />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="inquiry-message" className="text-xs font-semibold uppercase tracking-[0.26em] text-text-secondary">
          Message
        </label>
        <textarea
          id="inquiry-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={cn(fieldClassName, 'min-h-36 resize-y px-4 py-4')}
          placeholder="Share the event, desired glam style, party size, timing, or content needs."
          required
        />
      </div>

      {feedback && (
        <p
          className={cn(
            'rounded-[20px] px-4 py-3 text-sm',
            status === 'success'
              ? 'bg-[rgba(60,121,82,0.12)] text-[#244b33] dark:bg-[rgba(83,186,120,0.16)] dark:text-[#d7f1de]'
              : 'bg-[rgba(153,51,51,0.10)] text-[#7a1f1f] dark:bg-[rgba(255,122,122,0.12)] dark:text-[#ffd2d2]'
          )}
        >
          {feedback}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-950 px-6 py-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent-gold dark:text-forest-950"
      >
        {status === 'submitting' ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Sending inquiry
          </>
        ) : (
          <>
            Send inquiry
            <Send size={16} />
          </>
        )}
      </button>
    </form>
  );
}
