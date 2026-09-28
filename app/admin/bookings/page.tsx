'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, Loader2, Mail, Phone, RefreshCw, ShieldCheck, Trash2, UserRound } from 'lucide-react';

import { formatCurrency } from '@/lib/format';
import { BUSINESS_TIME_ZONE } from '@/lib/timezone';
import { cn } from '@/lib/utils';
import type { AdminBookingRow } from '@/lib/types';

type Filter = 'attention' | 'upcoming' | 'past' | 'all';
type Notice = { tone: 'success' | 'error'; text: string };
type SentTo = { client: string; team: string[] };

const INTAKE_LABELS: Record<string, string> = {
  occasion: 'Occasion',
  lookType: 'Look',
  skinType: 'Skin type',
  skinConditionsOrAllergies: 'Skin conditions / allergies',
  lashesPreference: 'Lashes',
  hadProfessionalMakeupBefore: 'Had makeup done before',
  priorExperienceNotes: 'Past experience',
  productPreferencesOrRestrictions: 'Product preferences',
  appointmentDateTimeNeeded: 'Ready-by time',
  referenceDescription: 'Inspiration',
};

const OPEN_HOLD_STATES = new Set(['pending_payment', 'expired']);

function dateParts(value: string) {
  const date = new Date(value);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: BUSINESS_TIME_ZONE, ...options }).format(date);
  return {
    month: part({ month: 'short' }),
    day: part({ day: 'numeric' }),
    weekday: part({ weekday: 'short' }),
    year: part({ year: 'numeric' }),
    time: part({ hour: 'numeric', minute: '2-digit' }),
  };
}

function needsAttention(row: AdminBookingRow, now: number) {
  return row.entryType === 'reservation' && OPEN_HOLD_STATES.has(row.status) && new Date(row.startsAt).getTime() >= now;
}

function sentSummary(sent: SentTo | null | undefined) {
  if (!sent) return 'Confirmation emails sent.';
  const team = sent.team.length > 0 ? ` and ${sent.team.join(', ')}` : '';
  return `Confirmation sent to ${sent.client}${team}.`;
}

const PILL_TONES: Record<string, string> = {
  confirmed: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
  completed: 'border-[#C99361]/30 bg-[#C99361]/15 text-[#F7E7C1]',
  paid: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
  pending: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  pending_payment: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  expired: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  cancelled: 'border-white/10 bg-white/5 text-[#e8d3bd]/70',
  refunded: 'border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-200',
  failed: 'border-red-400/30 bg-red-400/10 text-red-200',
};

function Pill({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em]',
        PILL_TONES[status] ?? 'border-white/10 bg-white/5 text-[#e8d3bd]/80',
      )}
    >
      {label ?? status.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/bookings', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to load bookings.');
      setBookings(json.bookings);
    } catch (loadError) {
      setNotice({ tone: 'error', text: loadError instanceof Error ? loadError.message : 'Unable to load bookings.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const now = Date.now();
  const groups = useMemo(() => {
    const byStartAsc = (a: AdminBookingRow, b: AdminBookingRow) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    const attention = bookings.filter((row) => needsAttention(row, now)).sort(byStartAsc);
    const upcoming = bookings
      .filter((row) => row.entryType === 'booking' && row.status === 'confirmed' && new Date(row.startsAt).getTime() >= now)
      .sort(byStartAsc);
    const past = bookings.filter((row) => !attention.includes(row) && !upcoming.includes(row));
    return { attention, upcoming, past, all: bookings };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const activeFilter: Filter = filter ?? (groups.attention.length > 0 ? 'attention' : 'upcoming');
  const rows = groups[activeFilter];

  const tabs: Array<{ key: Filter; label: string; count: number }> = [
    { key: 'attention', label: 'Needs attention', count: groups.attention.length },
    { key: 'upcoming', label: 'Upcoming', count: groups.upcoming.length },
    { key: 'past', label: 'Past & closed', count: groups.past.length },
    { key: 'all', label: 'All', count: groups.all.length },
  ];

  async function updateStatus(bookingId: string, status: string) {
    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await response.json();
    if (!response.ok) {
      setNotice({ tone: 'error', text: json.error ?? 'Unable to update booking.' });
      return;
    }
    setBookings((current) => current.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)));
  }

  async function resendEmail(booking: AdminBookingRow) {
    setBusyId(booking.id);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}/email`, { method: 'POST' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to resend booking email.');
      setNotice({ tone: 'success', text: `${booking.clientName}: ${sentSummary(json.sent)}` });
    } catch (sendError) {
      setNotice({ tone: 'error', text: sendError instanceof Error ? sendError.message : 'Unable to resend booking email.' });
    } finally {
      setBusyId(null);
    }
  }

  async function confirmHold(booking: AdminBookingRow) {
    if (!window.confirm(`Check Stripe for ${booking.clientName}'s deposit and confirm the booking if it was paid?`)) return;
    setBusyId(booking.id);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}/confirm`, { method: 'POST' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to confirm this booking.');
      setNotice(
        json.emailError
          ? { tone: 'error', text: `${booking.clientName} is now booked, but the emails failed: ${json.emailError}. Use Resend confirmation to try again.` }
          : { tone: 'success', text: `${booking.clientName} is now booked. ${sentSummary(json.sent)}` },
      );
      await load();
    } catch (confirmError) {
      setNotice({ tone: 'error', text: confirmError instanceof Error ? confirmError.message : 'Unable to confirm this booking.' });
    } finally {
      setBusyId(null);
    }
  }

  async function removeRow(booking: AdminBookingRow) {
    const label = booking.entryType === 'booking' ? 'delete this booking' : 'delete this payment hold';
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;

    setBusyId(booking.id);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}?entryType=${booking.entryType}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to delete booking row.');
      setBookings((current) => current.filter((item) => item.id !== booking.id));
    } catch (removeError) {
      setNotice({ tone: 'error', text: removeError instanceof Error ? removeError.message : 'Unable to delete booking row.' });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#C99361]">Operations</p>
          <h1 className="mt-2 font-serif text-4xl text-[#F7E7C1]">Bookings</h1>
          <p className="mt-2 max-w-xl text-sm text-[#e8d3bd]/80">
            Upcoming appointments, and any deposits that still need confirming.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-full border border-[rgba(201,147,97,0.25)] px-4 py-2 text-sm text-[#e8d3bd] transition hover:bg-[rgba(139,68,17,0.24)] disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
          Refresh
        </button>
      </header>

      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter bookings">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition',
              activeFilter === tab.key
                ? 'border-[#C99361]/50 bg-[rgba(139,68,17,0.35)] text-[#F7E7C1]'
                : 'border-[rgba(201,147,97,0.16)] text-[#e8d3bd]/80 hover:bg-[rgba(139,68,17,0.14)]',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px]',
                tab.key === 'attention' && tab.count > 0 ? 'bg-amber-400/20 text-amber-200' : 'bg-white/10 text-[#e8d3bd]',
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </nav>

      {notice && (
        <div
          role="status"
          className={cn(
            'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm',
            notice.tone === 'success'
              ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
              : 'border-red-400/30 bg-red-400/10 text-red-100',
          )}
        >
          {notice.tone === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
          <p className="flex-1">{notice.text}</p>
          <button type="button" onClick={() => setNotice(null)} className="text-xs uppercase tracking-[0.18em] opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {loading && bookings.length === 0 ? (
        <div className="flex items-center justify-center gap-3 rounded-3xl border border-[rgba(201,147,97,0.16)] py-16 text-sm text-[#e8d3bd]/80">
          <Loader2 size={16} className="animate-spin" /> Loading bookings
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[rgba(201,147,97,0.2)] px-6 py-16 text-center text-sm text-[#e8d3bd]/70">
          {activeFilter === 'attention' ? 'Nothing needs your attention right now.' : 'No bookings here yet.'}
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((booking) => {
            const when = dateParts(booking.startsAt);
            const isHold = booking.entryType === 'reservation';
            const openHold = needsAttention(booking, now);
            const busy = busyId === booking.id;
            const reference = booking.bookingReference ?? booking.reservationId ?? '';

            return (
              <li
                key={`${booking.entryType}-${booking.id}`}
                className={cn(
                  'overflow-hidden rounded-3xl border bg-[rgba(20,13,5,0.6)]',
                  openHold ? 'border-amber-400/30' : 'border-[rgba(201,147,97,0.16)]',
                )}
              >
                <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start">
                  <div className="flex shrink-0 items-center gap-4 md:w-28 md:flex-col md:items-start md:gap-1">
                    <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(139,68,17,0.35),rgba(74,33,9,0.55))] text-[#F7E7C1]">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#C99361]">{when.month}</span>
                      <span className="font-serif text-2xl leading-none">{when.day}</span>
                    </div>
                    <div className="text-sm text-[#e8d3bd] md:mt-2">
                      <p className="flex items-center gap-1.5"><Clock size={13} className="text-[#C99361]" />{when.time}</p>
                      <p className="text-xs text-[#e8d3bd]/60">{when.weekday}, {when.year}</p>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill status={booking.status} label={isHold ? (booking.status === 'cancelled' ? 'Hold cancelled' : 'Payment hold') : undefined} />
                      <Pill status={booking.paymentStatus} label={`Deposit ${booking.paymentStatus.replace(/_/g, ' ')}`} />
                    </div>
                    <div>
                      <h2 className="flex items-center gap-2 text-lg font-medium text-[#F7E7C1]">
                        <UserRound size={16} className="shrink-0 text-[#C99361]" />
                        <span className="truncate">{booking.clientName}</span>
                      </h2>
                      <p className="mt-1 text-sm text-[#e8d3bd]">
                        {booking.serviceName} <span className="text-[#e8d3bd]/50">with</span> {booking.stylistName}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      {booking.clientEmail && (
                        <a href={`mailto:${booking.clientEmail}`} className="flex min-w-0 items-center gap-1.5 text-[#e8d3bd]/80 hover:text-[#F7E7C1]">
                          <Mail size={13} className="shrink-0 text-[#C99361]" /><span className="truncate">{booking.clientEmail}</span>
                        </a>
                      )}
                      {booking.clientPhone && (
                        <a href={`tel:${booking.clientPhone}`} className="flex items-center gap-1.5 text-[#e8d3bd]/80 hover:text-[#F7E7C1]">
                          <Phone size={13} className="text-[#C99361]" />{booking.clientPhone}
                        </a>
                      )}
                    </div>
                    {(booking.depositAmount !== null || booking.appointmentTotal !== null) && (
                      <dl className="grid grid-cols-3 gap-2 rounded-2xl border border-[rgba(201,147,97,0.12)] p-3 text-sm sm:max-w-md">
                        {[
                          ['Deposit', booking.depositAmount],
                          ['Total', booking.appointmentTotal],
                          ['Due at appt', booking.balanceDue],
                        ].map(([label, amount]) => (
                          <div key={label as string}>
                            <dt className="text-[10px] uppercase tracking-[0.18em] text-[#C99361]/80">{label}</dt>
                            <dd className="mt-0.5 text-[#F7E7C1]">{amount === null ? '—' : formatCurrency(amount as number)}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {booking.sameDay && <Pill status="pending" label="Same-day add-on" />}
                    {booking.intake && Object.keys(booking.intake).length > 0 && (
                      <details className="group rounded-2xl border border-[rgba(201,147,97,0.12)] px-3 py-2 text-sm">
                        <summary className="cursor-pointer select-none text-[#e8d3bd] marker:text-[#C99361]">Client&apos;s makeup details</summary>
                        <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                          {Object.entries(booking.intake)
                            .filter(([key]) => key !== 'referenceImageAssetId')
                            .map(([key, value]) => (
                              <div key={key} className="min-w-0">
                                <dt className="text-[10px] uppercase tracking-[0.18em] text-[#C99361]/80">{INTAKE_LABELS[key] ?? (key === 'referenceImageUrl' ? 'Reference photo' : key)}</dt>
                                <dd className="mt-0.5 break-words text-[#e8d3bd]">
                                  {key === 'referenceImageUrl' ? (
                                    <a href={value} target="_blank" rel="noreferrer" className="underline decoration-[#C99361]/50 hover:text-[#F7E7C1]">View photo</a>
                                  ) : (
                                    value.replace(/_/g, ' ')
                                  )}
                                </dd>
                              </div>
                            ))}
                        </dl>
                      </details>
                    )}
                    {booking.notes && <p className="rounded-2xl bg-white/[0.04] px-3 py-2 text-sm text-[#e8d3bd]/80">{booking.notes}</p>}
                    {reference && (
                      <p className="truncate font-mono text-[11px] text-[#e8d3bd]/45" title={reference}>
                        <CalendarDays size={11} className="mr-1 inline" />
                        {isHold ? 'Hold ' : ''}{reference}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 md:w-56">
                    {isHold ? (
                      openHold && (
                        <button
                          type="button"
                          onClick={() => void confirmHold(booking)}
                          disabled={busy}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C99361] px-4 py-2.5 text-sm font-medium text-[#140d05] transition hover:bg-[#d8a878] disabled:opacity-60"
                        >
                          {busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                          Verify payment &amp; confirm
                        </button>
                      )
                    ) : (
                      <>
                        <select
                          value={booking.status}
                          onChange={(event) => void updateStatus(booking.id, event.target.value)}
                          aria-label="Booking status"
                          className="w-full rounded-full border border-[rgba(201,147,97,0.25)] bg-[#140d05] px-4 py-2.5 text-sm text-[#F7E7C1] outline-none focus:border-[#C99361]"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => void resendEmail(booking)}
                          disabled={busy || booking.paymentStatus !== 'paid'}
                          title={booking.paymentStatus === 'paid' ? 'Email the confirmation to the client and to you' : 'Only paid bookings can resend confirmation emails'}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#C99361]/40 px-4 py-2.5 text-sm text-[#F7E7C1] transition hover:bg-[rgba(139,68,17,0.3)] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {busy ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                          Resend confirmation
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => void removeRow(booking)}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs text-red-300/80 transition hover:bg-red-400/10 hover:text-red-200 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      {isHold ? 'Delete hold' : 'Delete booking'}
                    </button>
                  </div>
                </div>

                {openHold && (
                  <p className="border-t border-amber-400/20 bg-amber-400/[0.06] px-5 py-3 text-xs leading-5 text-amber-100/90">
                    This time is not locked in yet. If the client paid, verify it: Stripe is checked first, then the booking is confirmed and the client and you both get the confirmation email.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
