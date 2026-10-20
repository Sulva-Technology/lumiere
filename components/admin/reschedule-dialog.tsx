'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarClock, Loader2, X } from 'lucide-react';

import { BUSINESS_TIME_ZONE, businessDateKey } from '@/lib/timezone';
import { cn } from '@/lib/utils';
import type { AdminBookingRow } from '@/lib/types';

type OpenTime = { time: string; label: string };
export type RescheduleResult = {
  startsAt: string;
  sent: { client: string; team: string[] } | null;
  emailError: string | null;
};

function describe(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function clockTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: BUSINESS_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value));
}

export function RescheduleDialog({
  booking,
  onClose,
  onDone,
}: {
  booking: AdminBookingRow;
  onClose: () => void;
  onDone: (result: RescheduleResult) => void;
}) {
  const today = businessDateKey(new Date());
  const currentDay = businessDateKey(booking.startsAt);
  const [day, setDay] = useState(currentDay < today ? today : currentDay);
  const [time, setTime] = useState(clockTime(booking.startsAt));
  const [openTimes, setOpenTimes] = useState<OpenTime[] | null>(null);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [notifyClient, setNotifyClient] = useState(Boolean(booking.clientEmail));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && !saving && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  useEffect(() => {
    if (!day) return;
    let cancelled = false;
    setLoadingTimes(true);
    fetch(`/api/admin/bookings/${booking.id}/reschedule?day=${day}`, { cache: 'no-store' })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load open times.');
        if (!cancelled) setOpenTimes(json.times);
      })
      .catch(() => {
        if (!cancelled) setOpenTimes(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingTimes(false);
      });
    return () => {
      cancelled = true;
    };
  }, [booking.id, day]);

  // A refusal is about the time that was tried; drop it once a different one is picked.
  useEffect(() => setError(null), [day, time]);

  const unchanged = day === currentDay && time === clockTime(booking.startsAt);
  const outsideHours = Boolean(openTimes && time && !openTimes.some((option) => option.time === time));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, time, notifyClient }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to move this booking.');
      onDone(json as RescheduleResult);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to move this booking.');
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => !saving && onClose()}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[rgba(201,147,97,0.22)] bg-[#1a1007] p-5 text-[#F7E7C1] shadow-2xl sm:rounded-3xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#C99361]">Move appointment</p>
            <h2 id="reschedule-title" className="mt-1 font-serif text-2xl">{booking.clientName}</h2>
            <p className="mt-1 text-sm text-[#e8d3bd]/80">{booking.serviceName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-full border border-white/15 p-2 text-[#e8d3bd] hover:bg-white/10 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-4 rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-[#e8d3bd]">
          <span className="text-[#e8d3bd]/60">Currently booked for </span>
          {describe(booking.startsAt)}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs uppercase tracking-[0.18em] text-[#C99361]/90">New date</span>
            <input
              type="date"
              value={day}
              min={today}
              onChange={(event) => setDay(event.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-[rgba(201,147,97,0.25)] bg-[#140d05] px-4 py-2.5 text-[#F7E7C1] outline-none [color-scheme:dark] focus:border-[#C99361]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs uppercase tracking-[0.18em] text-[#C99361]/90">New time (Arizona)</span>
            <input
              type="time"
              value={time}
              step={900}
              onChange={(event) => setTime(event.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-[rgba(201,147,97,0.25)] bg-[#140d05] px-4 py-2.5 text-[#F7E7C1] outline-none [color-scheme:dark] focus:border-[#C99361]"
            />
          </label>
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#C99361]/90">Open times that day</p>
          {loadingTimes ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-[#e8d3bd]/70">
              <Loader2 size={14} className="animate-spin" /> Checking your calendar
            </p>
          ) : openTimes && openTimes.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {openTimes.map((option) => (
                <button
                  key={option.time}
                  type="button"
                  onClick={() => setTime(option.time)}
                  aria-pressed={time === option.time}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    time === option.time
                      ? 'border-[#C99361] bg-[#C99361] text-[#140d05]'
                      : 'border-[rgba(201,147,97,0.25)] text-[#e8d3bd] hover:bg-[rgba(139,68,17,0.3)]',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#e8d3bd]/70">
              {openTimes ? 'No open times in your usual hours on this day. You can still type any time above.' : 'Could not load open times. You can still type any time above.'}
            </p>
          )}
        </div>

        {outsideHours && !unchanged && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-100">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            This time is outside your usual hours or within your break after another appointment. You can still save it.
          </p>
        )}

        <label className={cn('mt-5 flex items-start gap-3 rounded-2xl border border-[rgba(201,147,97,0.16)] px-4 py-3 text-sm', !booking.clientEmail && 'opacity-50')}>
          <input
            type="checkbox"
            checked={notifyClient}
            disabled={!booking.clientEmail}
            onChange={(event) => setNotifyClient(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#C99361]"
          />
          <span>
            Email {booking.clientName} the updated confirmation
            <span className="mt-0.5 block text-xs text-[#e8d3bd]/60">
              {booking.clientEmail ? `Sent to ${booking.clientEmail}, showing the new and old time. You get a copy too.` : 'No email address on this booking.'}
            </span>
          </span>
        </label>

        {error && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full px-5 py-2.5 text-sm text-[#e8d3bd] hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || unchanged || !day || !time}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C99361] px-5 py-2.5 text-sm font-medium text-[#140d05] transition hover:bg-[#d8a878] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CalendarClock size={15} />}
            {notifyClient ? 'Save & email client' : 'Save new time'}
          </button>
        </div>
      </div>
    </div>
  );
}
