'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Check, Clock, Repeat, Trash2 } from 'lucide-react';
import { Glass } from '@/components/ui/glass';
import type { AvailabilityDayOverride, AvailabilityRule, StylistSummary } from '@/lib/types';

interface AvailabilitySlot {
  id: string;
  starts_at: string;
  ends_at: string;
  is_available: boolean;
  has_booking: boolean;
  is_reserved: boolean;
  booking_services: { name: string } | null;
  stylists: { name: string } | null;
}

interface DayForm {
  weekday: number;
  off: boolean;
  startTime: string;
  endTime: string;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';

const LABEL_CLASS = 'text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]';
const INPUT_CLASS = 'rounded-2xl bg-white/10 px-4 py-3 text-sm text-[var(--text-primary)] outline-none';
const BUTTON_PRIMARY =
  'rounded-2xl bg-[#8B4411] px-5 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50';
const BUTTON_QUIET =
  'rounded-2xl border border-[#8B4411]/20 bg-white/40 px-4 py-2 text-sm font-medium text-[#713813] transition-colors hover:bg-white/70 disabled:opacity-50';

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function buildWeek(rules: AvailabilityRule[]): DayForm[] {
  return WEEKDAYS.map((_, weekday) => {
    const windows = rules.filter((rule) => rule.weekday === weekday && rule.active);
    if (windows.length === 0) {
      return { weekday, off: true, startTime: DEFAULT_START, endTime: DEFAULT_END };
    }
    return {
      weekday,
      off: false,
      startTime: windows.reduce((earliest, rule) => (rule.startTime < earliest ? rule.startTime : earliest), windows[0].startTime),
      endTime: windows.reduce((latest, rule) => (rule.endTime > latest ? rule.endTime : latest), windows[0].endTime),
    };
  });
}

/** Slot dates are read exactly as they are stored, so nothing shifts when she is travelling. */
function slotDateKey(startsAt: string) {
  return startsAt.slice(0, 10);
}

function formatDayLabel(dayKey: string) {
  return new Date(`${dayKey}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminAvailabilityPage() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityDayOverride[]>([]);
  const [stylists, setStylists] = useState<StylistSummary[]>([]);
  const [week, setWeek] = useState<DayForm[]>(() => buildWeek([]));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyDay, setBusyDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [overrideDate, setOverrideDate] = useState('');
  const [overrideMode, setOverrideMode] = useState<'off' | 'hours'>('off');
  const [overrideStart, setOverrideStart] = useState(DEFAULT_START);
  const [overrideEnd, setOverrideEnd] = useState(DEFAULT_END);

  const primaryStylistId = stylists[0]?.id ?? '';

  async function loadData() {
    try {
      const [availabilityRes, rulesRes, overridesRes, stylistsRes] = await Promise.all([
        fetch('/api/admin/availability'),
        fetch('/api/admin/availability/rules'),
        fetch('/api/admin/availability/overrides'),
        fetch('/api/booking/stylists'),
      ]);

      const [availabilityJson, rulesJson, overridesJson, stylistsJson] = await Promise.all([
        availabilityRes.json(),
        rulesRes.json(),
        overridesRes.json(),
        stylistsRes.json(),
      ]);

      if (!availabilityRes.ok) throw new Error(availabilityJson.error ?? 'Could not load your open times.');
      if (!rulesRes.ok) throw new Error(rulesJson.error ?? 'Could not load your working week.');
      if (!overridesRes.ok) throw new Error(overridesJson.error ?? 'Could not load your changed days.');
      if (!stylistsRes.ok) throw new Error(stylistsJson.error ?? 'Could not load your profile.');

      const loadedRules: AvailabilityRule[] = rulesJson.data.rules;
      setAvailability(availabilityJson.data.availability);
      setRules(loadedRules);
      setOverrides(overridesJson.data.overrides);
      setStylists(stylistsJson.stylists);
      setWeek(buildWeek(loadedRules.filter((rule) => rule.active && rule.serviceId === null)));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your availability.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function changeSummary(result: { removed?: number; kept?: number }) {
    const removed = result.removed ?? 0;
    const kept = result.kept ?? 0;
    const parts = [`Saved. ${removed} open time${removed === 1 ? '' : 's'} turned off.`];
    if (kept > 0) {
      parts.push(`${kept} time${kept === 1 ? '' : 's'} already taken by clients were kept.`);
    }
    return parts.join(' ');
  }

  function updateDay(weekday: number, patch: Partial<DayForm>) {
    setWeek((current) => current.map((day) => (day.weekday === weekday ? { ...day, ...patch } : day)));
  }

  async function handleSaveWeek(event: React.FormEvent) {
    event.preventDefault();
    if (!primaryStylistId) return;

    const broken = week.find((day) => !day.off && day.endTime <= day.startTime);
    if (broken) {
      setError(`${WEEKDAYS[broken.weekday]}: the finish time must be later than the start time.`);
      setNotice(null);
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch('/api/admin/availability/week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stylistId: primaryStylistId,
          days: week.map((day) => ({
            weekday: day.weekday,
            off: day.off,
            startTime: day.startTime,
            endTime: day.endTime,
          })),
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Could not save your week.');

      await loadData();
      setNotice(changeSummary(json.data));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your week.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSetOverride(event: React.FormEvent) {
    event.preventDefault();
    if (!primaryStylistId || !overrideDate) return;

    if (overrideMode === 'hours' && overrideEnd <= overrideStart) {
      setError('The finish time must be later than the start time.');
      setNotice(null);
      return;
    }

    setBusyDay(overrideDate);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch('/api/admin/availability/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stylistId: primaryStylistId,
          day: overrideDate,
          mode: overrideMode,
          startTime: overrideMode === 'hours' ? overrideStart : undefined,
          endTime: overrideMode === 'hours' ? overrideEnd : undefined,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Could not save that day.');

      await loadData();
      setNotice(changeSummary(json.data));
      setOverrideDate('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save that day.');
    } finally {
      setBusyDay(null);
    }
  }

  async function handleDayOff(dayKey: string) {
    if (!primaryStylistId) return;

    setBusyDay(dayKey);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch('/api/admin/availability/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stylistId: primaryStylistId, day: dayKey, mode: 'off' }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Could not turn that day off.');

      await loadData();
      setNotice(changeSummary(json.data));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not turn that day off.');
    } finally {
      setBusyDay(null);
    }
  }

  async function handleUndoOverride(id: string) {
    setBusyDay(id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/availability/overrides?id=${id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Could not undo that day change.');

      await loadData();
      setNotice('Undone. That day follows your normal week again.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not undo that day change.');
    } finally {
      setBusyDay(null);
    }
  }

  const daySummaries = useMemo(() => {
    const map = new Map<string, { open: number; booked: number }>();
    for (const slot of availability) {
      const key = slotDateKey(slot.starts_at);
      const entry = map.get(key) ?? { open: 0, booked: 0 };
      if (slot.has_booking || slot.is_reserved) {
        entry.booked += 1;
      } else {
        entry.open += 1;
      }
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dayKey, counts]) => ({ dayKey, ...counts }));
  }, [availability]);

  if (loading) return <div className="p-8 text-center text-[var(--text-secondary)]">Loading your availability...</div>;

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#8B4411]">Booking Setup</p>
        <h1 className="font-serif text-3xl text-[#4A2109] md:text-4xl">When you are available</h1>
        <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
          Set your normal week below. Everything you leave on shows up on your booking page for clients to choose.
        </p>
      </header>

      {error && <div className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-600">{error}</div>}
      {notice && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#8B4411]/20 bg-[#f6e7d3] p-4 text-sm text-[#713813]">
          <Check size={18} className="shrink-0 text-[#8B4411]" />
          <span>{notice}</span>
        </div>
      )}

      <Glass level="medium" className="p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Repeat size={20} className="text-[#8B4411]" />
          <div>
            <h2 className="font-serif text-2xl text-[#4A2109]">Your normal week</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Turn a day off, or change its hours. Clients only see what is on.</p>
          </div>
        </div>

        <form onSubmit={handleSaveWeek} className="space-y-3">
          {week.map((day) => (
            <div
              key={day.weekday}
              className="flex flex-col gap-3 rounded-2xl bg-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-28 font-medium text-[#4A2109]">{WEEKDAYS[day.weekday]}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!day.off}
                  aria-label={`${WEEKDAYS[day.weekday]} availability`}
                  onClick={() => updateDay(day.weekday, { off: !day.off })}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                    day.off
                      ? 'bg-white/40 text-[var(--text-secondary)] hover:bg-white/60'
                      : 'bg-[#8B4411] text-white hover:opacity-90'
                  }`}
                >
                  {day.off ? 'Off' : 'Working'}
                </button>
              </div>

              {day.off ? (
                <p className="text-sm text-[var(--text-secondary)] sm:pr-2">No appointments this day</p>
              ) : (
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-[var(--text-secondary)]" />
                  <label className="sr-only" htmlFor={`start-${day.weekday}`}>
                    {WEEKDAYS[day.weekday]} start time
                  </label>
                  <input
                    id={`start-${day.weekday}`}
                    type="time"
                    value={day.startTime}
                    onChange={(event) => updateDay(day.weekday, { startTime: event.target.value })}
                    className="rounded-xl bg-white/40 px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
                  />
                  <span className="text-[var(--text-secondary)]">to</span>
                  <label className="sr-only" htmlFor={`end-${day.weekday}`}>
                    {WEEKDAYS[day.weekday]} finish time
                  </label>
                  <input
                    id={`end-${day.weekday}`}
                    type="time"
                    value={day.endTime}
                    onChange={(event) => updateDay(day.weekday, { endTime: event.target.value })}
                    className="rounded-xl bg-white/40 px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
                  />
                </div>
              )}
            </div>
          ))}

          <button type="submit" disabled={saving || !primaryStylistId} className={`${BUTTON_PRIMARY} w-full sm:w-auto sm:px-8`}>
            {saving ? 'Saving your week...' : 'Save my week'}
          </button>
        </form>
      </Glass>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Glass level="medium" className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <Calendar size={20} className="text-[#8B4411]" />
            <div>
              <h2 className="font-serif text-2xl text-[#4A2109]">One date that is different</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Keep your normal week as it is. You can also open a day you are normally off.
              </p>
            </div>
          </div>

          <form onSubmit={handleSetOverride} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="override-date" className={LABEL_CLASS}>
                Which date
              </label>
              <input
                id="override-date"
                type="date"
                required
                min={todayKey()}
                value={overrideDate}
                onChange={(event) => setOverrideDate(event.target.value)}
                className={`${INPUT_CLASS} w-full`}
              />
            </div>

            <div className="space-y-2">
              <span className={LABEL_CLASS}>What changes</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOverrideMode('off')}
                  aria-pressed={overrideMode === 'off'}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    overrideMode === 'off'
                      ? 'bg-[#4A2109] text-white'
                      : 'bg-white/40 text-[#713813] hover:bg-white/60'
                  }`}
                >
                  Day off
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideMode('hours')}
                  aria-pressed={overrideMode === 'hours'}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    overrideMode === 'hours'
                      ? 'bg-[#4A2109] text-white'
                      : 'bg-white/40 text-[#713813] hover:bg-white/60'
                  }`}
                >
                  Different hours
                </button>
              </div>
            </div>

            {overrideMode === 'hours' && (
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-[var(--text-secondary)]" />
                <label className="sr-only" htmlFor="override-start">
                  Start time
                </label>
                <input
                  id="override-start"
                  type="time"
                  value={overrideStart}
                  onChange={(event) => setOverrideStart(event.target.value)}
                  className="rounded-xl bg-white/40 px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
                />
                <span className="text-[var(--text-secondary)]">to</span>
                <label className="sr-only" htmlFor="override-end">
                  Finish time
                </label>
                <input
                  id="override-end"
                  type="time"
                  value={overrideEnd}
                  onChange={(event) => setOverrideEnd(event.target.value)}
                  className="rounded-xl bg-white/40 px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
                />
              </div>
            )}

            <button type="submit" disabled={!overrideDate || busyDay === overrideDate} className={`${BUTTON_PRIMARY} w-full`}>
              {busyDay === overrideDate ? 'Saving...' : 'Set this date'}
            </button>
          </form>

          <div className="mt-8 space-y-3">
            <h3 className={LABEL_CLASS}>Dates you changed</h3>
            {overrides.length > 0 ? (
              overrides.map((override) => (
                <div key={override.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-4">
                  <div>
                    <p className="font-medium text-[#4A2109]">{formatDayLabel(override.day)}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {override.isOff
                        ? 'Day off'
                        : `${override.startTime ?? ''} to ${override.endTime ?? ''}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleUndoOverride(override.id)}
                    disabled={busyDay === override.id}
                    className={BUTTON_QUIET}
                  >
                    Undo
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-white/10 p-4 text-sm text-[var(--text-secondary)]">
                No changed dates. Every day follows your normal week.
              </p>
            )}
          </div>
        </Glass>

        <Glass level="medium" className="p-6">
          <div className="mb-6">
            <h2 className="font-serif text-2xl text-[#4A2109]">What clients can book</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Next 13 weeks. Turn a whole date off here if you cannot work it.
            </p>
          </div>

          <div className="space-y-3">
            {daySummaries.length > 0 ? (
              daySummaries.map((day) => (
                <div key={day.dayKey} className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-4">
                  <div>
                    <p className="font-medium text-[#4A2109]">{formatDayLabel(day.dayKey)}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {day.open > 0 ? `${day.open} open time${day.open === 1 ? '' : 's'}` : 'Nothing open'}
                      {day.booked > 0 ? ` · ${day.booked} already taken by clients` : ''}
                    </p>
                  </div>
                  {day.open > 0 && (
                    <button
                      type="button"
                      onClick={() => void handleDayOff(day.dayKey)}
                      disabled={busyDay === day.dayKey}
                      className={`${BUTTON_QUIET} inline-flex items-center gap-2`}
                    >
                      <Trash2 size={15} />
                      Turn off
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-white/10 p-4 text-sm text-[var(--text-secondary)]">
                Nothing open yet. Turn on your days above and save.
              </p>
            )}
          </div>
        </Glass>
      </div>
    </div>
  );
}
