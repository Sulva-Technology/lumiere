'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';

import { Glass } from '@/components/ui/glass';
import { isAnalyticsIgnored, setAnalyticsIgnored } from '@/lib/analytics-client';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AnalyticsRange, AnalyticsReport } from '@/lib/data/analytics';

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
];

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/book': 'Booking',
  '/services': 'Services',
  '/about': 'About',
  '/contact': 'Contact',
  '/shop': 'Shop',
  '/product': 'Products',
  '/checkout': 'Checkout',
  '/track-order': 'Track order',
  '/privacy-policy': 'Privacy policy',
  '/terms-of-service': 'Terms of service',
  '/shipping-returns': 'Shipping & returns',
};

function titleCase(slug: string) {
  return decodeURIComponent(slug)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function pageName(path: string) {
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  const [, section, slug] = path.split('/');
  if (section === 'services' && slug) return `Service · ${titleCase(slug)}`;
  if (section === 'product' && slug) return `Product · ${titleCase(slug)}`;
  return path;
}

const numberFormat = new Intl.NumberFormat('en-US');
const percentFormat = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

function formatDay(day: string, compact: boolean) {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, date)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: compact ? undefined : 'short',
    day: 'numeric',
    weekday: compact ? 'narrow' : undefined,
  });
}

function Change({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const change = (current - previous) / previous;
  const up = change >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', up ? 'text-emerald-700' : 'text-red-600')}>
      <Icon size={14} aria-hidden />
      {percentFormat.format(Math.abs(change))}
      <span className="sr-only">{up ? 'increase' : 'decrease'} from the previous period</span>
    </span>
  );
}

function StatCard({ label, value, hint, children }: { label: string; value: string; hint?: string; children?: React.ReactNode }) {
  return (
    <Glass level="medium" className="p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[#8B4411]/80">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-serif text-3xl text-[#4A2109]">{value}</p>
        {children}
      </div>
      {hint ? <p className="mt-1 text-xs text-[var(--text-secondary)]">{hint}</p> : null}
    </Glass>
  );
}

function BarList({ title, items, empty }: { title: string; items: { label: string; value: number; detail?: string }[]; empty: string }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <Glass level="medium" className="p-5 sm:p-6">
      <h2 className="font-serif text-2xl text-[#4A2109]">{title}</h2>
      {items.length > 0 ? (
        <ul className="mt-5 space-y-2.5">
          {items.map((item) => (
            <li key={item.label} className="relative overflow-hidden rounded-xl bg-[rgba(139,68,17,0.04)] px-3 py-2.5">
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-xl bg-[rgba(139,68,17,0.12)]"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
              <div className="relative flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-[#4A2109]" title={item.detail ?? item.label}>
                  {item.label}
                </span>
                <span className="shrink-0 font-medium tabular-nums text-[#713813]">{numberFormat.format(item.value)}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-2xl bg-[rgba(139,68,17,0.04)] p-4 text-sm text-[var(--text-secondary)]">{empty}</p>
      )}
    </Glass>
  );
}

function DailyChart({ daily }: { daily: AnalyticsReport['daily'] }) {
  const max = Math.max(1, ...daily.map((day) => day.visitors));
  const compact = daily.length > 14;
  const labelEvery = daily.length > 31 ? 14 : daily.length > 14 ? 5 : 1;

  return (
    <Glass level="medium" className="p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-2xl text-[#4A2109]">Visitors per day</h2>
        <p className="text-xs text-[var(--text-secondary)]">Hover or tap a bar for details</p>
      </div>
      <div className="mt-6 flex h-48 items-end gap-[2px] sm:gap-1" role="list" aria-label="Visitors per day">
        {daily.map((day) => (
          <div
            key={day.date}
            role="listitem"
            tabIndex={0}
            className="group relative flex h-full min-w-0 flex-1 flex-col justify-end outline-none"
            aria-label={`${formatDay(day.date, false)}: ${day.visitors} visitors, ${day.pageViews} page views`}
          >
            <div
              className="w-full rounded-t-md bg-[#8B4411]/70 transition-colors group-hover:bg-[#8B4411] group-focus:bg-[#8B4411]"
              style={{ height: `${Math.max(day.visitors > 0 ? 3 : 1, (day.visitors / max) * 100)}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#4A2109] px-2.5 py-1.5 text-xs text-[#F7E7C1] shadow-lg group-hover:block group-focus:block">
              <p className="font-medium">{formatDay(day.date, false)}</p>
              <p>{day.visitors} visitors · {day.pageViews} views</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[2px] sm:gap-1" aria-hidden>
        {daily.map((day, index) => (
          <span key={day.date} className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center text-[10px] text-[var(--text-secondary)]">
            {index % labelEvery === 0 ? formatDay(day.date, compact && labelEvery === 1) : ''}
          </span>
        ))}
      </div>
    </Glass>
  );
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>('30');
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ignored, setIgnored] = useState(false);

  useEffect(() => {
    setIgnored(isAnalyticsIgnored());
  }, []);

  const load = useCallback(async (selected: AnalyticsRange) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics?range=${selected}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to load analytics.');
      setReport(json.report);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(range);
    const interval = window.setInterval(() => void load(range), 60_000);
    return () => window.clearInterval(interval);
  }, [load, range]);

  function toggleIgnored() {
    const next = !ignored;
    setAnalyticsIgnored(next);
    setIgnored(next);
  }

  const totals = report?.totals;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#C99361]">Growth</p>
          <h1 className="mt-2 font-serif text-4xl text-[#F7E7C1]">Website Analytics</h1>
          <p className="mt-2 max-w-xl text-sm text-[#e8d3bd]/75">
            Who is visiting, which pages they open, where they come from, and how many go on to book.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {report && !report.setupRequired ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {report.liveVisitors} on the site now
            </span>
          ) : null}

          <div className="inline-flex rounded-full border border-[rgba(201,147,97,0.2)] bg-[rgba(139,68,17,0.14)] p-1" role="group" aria-label="Date range">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                aria-pressed={range === option.value}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm transition-colors',
                  range === option.value ? 'bg-[#F7E7C1] font-medium text-[#4A2109]' : 'text-[#e8d3bd]/80 hover:text-[#F7E7C1]'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void load(range)}
            className="rounded-full border border-[rgba(201,147,97,0.2)] bg-[rgba(139,68,17,0.14)] p-2 text-[#e8d3bd] transition-colors hover:bg-[rgba(139,68,17,0.24)]"
            aria-label="Refresh analytics"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : undefined} />
          </button>
        </div>
      </div>

      {error ? (
        <Glass level="medium" className="p-4 text-sm text-red-600">
          {error}
        </Glass>
      ) : null}

      {report?.setupRequired ? (
        <Glass level="heavy" className="p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-[#4A2109]">One step to switch on visitor tracking</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
            The analytics table has not been created in the database yet. Open the Supabase dashboard, go to the SQL Editor, paste the
            contents of <code className="rounded bg-black/5 px-1.5 py-0.5">supabase/migrations/020_page_views.sql</code>, and press Run.
            Visits start appearing here within a minute of the next person opening the site.
          </p>
        </Glass>
      ) : null}

      {!report && loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-white/10" />
          ))}
        </div>
      ) : null}

      {report && totals && !report.setupRequired ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Visitors" value={numberFormat.format(totals.visitors)} hint="Unique people">
              <Change current={totals.visitors} previous={report.previous.visitors} />
            </StatCard>
            <StatCard label="Page views" value={numberFormat.format(totals.pageViews)} hint="Pages opened">
              <Change current={totals.pageViews} previous={report.previous.pageViews} />
            </StatCard>
            <StatCard label="Visits" value={numberFormat.format(totals.visits)} hint="Browsing sessions" />
            <StatCard label="Pages per visit" value={totals.pagesPerVisit.toFixed(1)} hint="Higher means more interest" />
            <StatCard
              label="Bookings"
              value={totals.bookings === null ? '—' : numberFormat.format(totals.bookings)}
              hint="Confirmed in this period"
            />
            <StatCard
              label="Booking rate"
              value={totals.conversionRate === null ? '—' : percentFormat.format(totals.conversionRate)}
              hint="Visitors who booked"
            />
          </div>

          {report.daily.length > 1 ? <DailyChart daily={report.daily} /> : null}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <BarList
              title="Most visited pages"
              items={report.topPages.map((page) => ({
                label: pageName(page.path),
                value: page.views,
                detail: `${page.path} · ${page.visitors} visitors`,
              }))}
              empty="Page visits will appear here as people browse the site."
            />
            <BarList
              title="Where visitors come from"
              items={report.sources.map((source) => ({ label: source.label, value: source.visitors }))}
              empty="Traffic sources will appear here as people arrive."
            />
            <BarList
              title="Visitor locations"
              items={report.locations.map((location) => ({ label: location.label, value: location.visitors }))}
              empty="Visitor cities and countries will appear here."
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <BarList
                title="Devices"
                items={report.devices.map((device) => ({ label: device.label, value: device.visitors }))}
                empty="No device data yet."
              />
              <BarList
                title="Browsers"
                items={report.browsers.map((browser) => ({ label: browser.label, value: browser.visitors }))}
                empty="No browser data yet."
              />
            </div>
          </div>

          <Glass level="medium" className="p-5 sm:p-6">
            <h2 className="font-serif text-2xl text-[#4A2109]">Latest activity</h2>
            {report.recent.length > 0 ? (
              <ul className="mt-5 divide-y divide-black/5">
                {report.recent.map((view, index) => (
                  <li key={`${view.createdAt}-${index}`} className="grid grid-cols-1 gap-1 py-3 text-sm sm:grid-cols-[150px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] sm:items-center sm:gap-4">
                    <span className="text-xs text-[var(--text-secondary)]">{formatDateTime(view.createdAt)}</span>
                    <span className="truncate font-medium text-[#4A2109]" title={view.path}>{pageName(view.path)}</span>
                    <span className="truncate text-[var(--text-secondary)]">{view.location}</span>
                    <span className="truncate text-[var(--text-secondary)]">{view.device}</span>
                    <span className="truncate text-[#713813]">{view.source}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-2xl bg-[rgba(139,68,17,0.04)] p-4 text-sm text-[var(--text-secondary)]">
                No visits in this period yet.
              </p>
            )}
          </Glass>
        </>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Glass level="medium" className="p-5 sm:p-6">
          <h2 className="font-serif text-xl text-[#4A2109]">Keep your own visits out</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Turn this on for each phone or computer you use to check the site, so the numbers only count real clients.
          </p>
          <button
            type="button"
            onClick={toggleIgnored}
            aria-pressed={ignored}
            className={cn(
              'mt-4 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              ignored ? 'bg-[#8B4411] text-[#F7E7C1]' : 'border border-[#8B4411]/30 text-[#8B4411] hover:bg-[#8B4411]/10'
            )}
          >
            {ignored ? 'This device is not counted' : "Don't count this device"}
          </button>
        </Glass>

        <Glass level="medium" className="p-5 sm:p-6">
          <h2 className="font-serif text-xl text-[#4A2109]">Know which posts bring bookings</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Add a tag to the links you share and they show up by name under &ldquo;Where visitors come from&rdquo;. For example, use
            this in your Instagram bio:
          </p>
          <code className="mt-3 block overflow-x-auto rounded-xl bg-[rgba(139,68,17,0.06)] px-3 py-2 text-xs text-[#4A2109]">
            https://itzlolabeauty.com/book?utm_source=instagram
          </code>
        </Glass>
      </div>
    </div>
  );
}
