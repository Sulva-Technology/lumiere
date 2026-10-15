import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { addDaysToKey, businessDateKey, businessDateTime } from '@/lib/timezone';

export type PageViewInput = {
  visitorId: string;
  sessionId: string;
  path: string;
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  device: string;
  browser: string;
  os: string;
  country: string | null;
  region: string | null;
  city: string | null;
};

export type AnalyticsRange = 'today' | '7' | '30' | '90';

type Breakdown = { label: string; visitors: number; share: number };

export type AnalyticsReport = {
  setupRequired: boolean;
  range: AnalyticsRange;
  liveVisitors: number;
  totals: {
    visitors: number;
    pageViews: number;
    visits: number;
    pagesPerVisit: number;
    returningVisitors: number;
    bookings: number | null;
    conversionRate: number | null;
  };
  previous: { visitors: number; pageViews: number };
  daily: { date: string; visitors: number; pageViews: number }[];
  topPages: { path: string; views: number; visitors: number }[];
  sources: Breakdown[];
  locations: Breakdown[];
  devices: Breakdown[];
  browsers: Breakdown[];
  recent: { createdAt: string; path: string; location: string; device: string; source: string }[];
};

type PageViewRow = {
  created_at: string;
  visitor_id: string;
  session_id: string;
  path: string;
  referrer_host: string | null;
  utm_source: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

const PAGE_SIZE = 1000;
const MAX_ROWS = 200_000;
const LIVE_WINDOW_MS = 5 * 60 * 1000;

const KNOWN_SOURCES: [RegExp, string][] = [
  [/instagram/, 'Instagram'],
  [/(^|\.)facebook\.|fb\.com|fb\.me/, 'Facebook'],
  [/tiktok/, 'TikTok'],
  [/google\./, 'Google'],
  [/bing\./, 'Bing'],
  [/yahoo\./, 'Yahoo'],
  [/duckduckgo/, 'DuckDuckGo'],
  [/pinterest|pin\.it/, 'Pinterest'],
  [/(^|\.)t\.co$|twitter|(^|\.)x\.com/, 'X / Twitter'],
  [/youtube|youtu\.be/, 'YouTube'],
  [/snapchat/, 'Snapchat'],
  [/whatsapp|wa\.me/, 'WhatsApp'],
  [/linktr\.ee/, 'Linktree'],
  [/yelp\./, 'Yelp'],
  [/chatgpt|openai/, 'ChatGPT'],
];

function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === '42P01' || error.code === 'PGRST205' || /page_views.*(does not exist|could not find)|(does not exist|could not find).*page_views/i.test(error.message ?? '');
}

export async function recordPageView(view: PageViewInput) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('page_views').insert({
    visitor_id: view.visitorId,
    session_id: view.sessionId,
    path: view.path,
    referrer_host: view.referrerHost,
    utm_source: view.utmSource,
    utm_medium: view.utmMedium,
    utm_campaign: view.utmCampaign,
    device: view.device,
    browser: view.browser,
    os: view.os,
    country: view.country,
    region: view.region,
    city: view.city,
  });

  if (error) throw new Error(error.message);
}

export function sourceLabel(utmSource: string | null, referrerHost: string | null) {
  const raw = (utmSource || referrerHost || '').trim().toLowerCase();
  if (!raw) return 'Direct / saved link';

  for (const [pattern, label] of KNOWN_SOURCES) {
    if (pattern.test(raw)) return label;
  }

  return raw.replace(/^www\./, '');
}

function locationLabel(row: Pick<PageViewRow, 'city' | 'region' | 'country'>) {
  const parts = [row.city, row.region, row.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Unknown';
}

function rangeStart(range: AnalyticsRange, todayKey: string) {
  const days = range === 'today' ? 1 : Number(range);
  return { days, startKey: addDaysToKey(todayKey, -(days - 1)) };
}

async function fetchPageViews(fromIso: string, toIso: string) {
  const supabase = createSupabaseAdminClient();
  const rows: PageViewRow[] = [];

  for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('page_views')
      .select('created_at, visitor_id, session_id, path, referrer_host, utm_source, device, browser, os, country, region, city')
      .gte('created_at', fromIso)
      .lt('created_at', toIso)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) return { rows, error };
    rows.push(...((data ?? []) as PageViewRow[]));
    if (!data || data.length < PAGE_SIZE) break;
  }

  return { rows, error: null };
}

async function countBookings(fromIso: string, toIso: string) {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', fromIso)
    .lt('created_at', toIso)
    .in('status', ['confirmed', 'completed']);

  return error ? null : (count ?? 0);
}

function breakdown(rows: PageViewRow[], labelFor: (row: PageViewRow) => string, limit = 8): Breakdown[] {
  const visitorsByLabel = new Map<string, Set<string>>();

  for (const row of rows) {
    const label = labelFor(row);
    const set = visitorsByLabel.get(label) ?? new Set<string>();
    set.add(row.visitor_id);
    visitorsByLabel.set(label, set);
  }

  const total = new Set(rows.map((row) => row.visitor_id)).size || 1;

  return Array.from(visitorsByLabel, ([label, set]) => ({ label, visitors: set.size, share: set.size / total }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, limit);
}

function emptyReport(range: AnalyticsRange, setupRequired: boolean): AnalyticsReport {
  return {
    setupRequired,
    range,
    liveVisitors: 0,
    totals: { visitors: 0, pageViews: 0, visits: 0, pagesPerVisit: 0, returningVisitors: 0, bookings: null, conversionRate: null },
    previous: { visitors: 0, pageViews: 0 },
    daily: [],
    topPages: [],
    sources: [],
    locations: [],
    devices: [],
    browsers: [],
    recent: [],
  };
}

export async function getAnalyticsReport(range: AnalyticsRange): Promise<AnalyticsReport> {
  const now = new Date();
  const todayKey = businessDateKey(now);
  const { days, startKey } = rangeStart(range, todayKey);
  const start = businessDateTime(startKey);
  const end = businessDateTime(addDaysToKey(todayKey, 1));
  const previousStart = businessDateTime(addDaysToKey(startKey, -days));

  const [current, previous, bookings] = await Promise.all([
    fetchPageViews(start.toISOString(), end.toISOString()),
    fetchPageViews(previousStart.toISOString(), start.toISOString()),
    countBookings(start.toISOString(), end.toISOString()),
  ]);

  if (current.error) {
    if (isMissingTable(current.error)) return emptyReport(range, true);
    throw new Error(current.error.message);
  }

  const rows = current.rows;
  const visitors = new Set(rows.map((row) => row.visitor_id));
  const visits = new Set(rows.map((row) => row.session_id));
  const previousVisitors = new Set(previous.rows.map((row) => row.visitor_id));

  const sessionsPerVisitor = new Map<string, Set<string>>();
  for (const row of rows) {
    const set = sessionsPerVisitor.get(row.visitor_id) ?? new Set<string>();
    set.add(row.session_id);
    sessionsPerVisitor.set(row.visitor_id, set);
  }
  const returningVisitors = Array.from(sessionsPerVisitor.values()).filter((set) => set.size > 1).length;

  const dailyMap = new Map<string, { visitors: Set<string>; pageViews: number }>();
  for (let i = 0; i < days; i += 1) {
    dailyMap.set(addDaysToKey(startKey, i), { visitors: new Set(), pageViews: 0 });
  }
  for (const row of rows) {
    const bucket = dailyMap.get(businessDateKey(row.created_at));
    if (!bucket) continue;
    bucket.visitors.add(row.visitor_id);
    bucket.pageViews += 1;
  }

  const pageMap = new Map<string, { views: number; visitors: Set<string> }>();
  for (const row of rows) {
    const entry = pageMap.get(row.path) ?? { views: 0, visitors: new Set<string>() };
    entry.views += 1;
    entry.visitors.add(row.visitor_id);
    pageMap.set(row.path, entry);
  }

  // A visit's source is wherever its first page view came from.
  const firstViewOfVisit = new Map<string, PageViewRow>();
  for (const row of rows) {
    firstViewOfVisit.set(row.session_id, row);
  }
  const visitEntries = Array.from(firstViewOfVisit.values());

  const liveSince = now.getTime() - LIVE_WINDOW_MS;
  const liveVisitors = new Set(rows.filter((row) => new Date(row.created_at).getTime() >= liveSince).map((row) => row.visitor_id)).size;

  return {
    setupRequired: false,
    range,
    liveVisitors,
    totals: {
      visitors: visitors.size,
      pageViews: rows.length,
      visits: visits.size,
      pagesPerVisit: visits.size > 0 ? rows.length / visits.size : 0,
      returningVisitors,
      bookings,
      conversionRate: bookings !== null && visitors.size > 0 ? bookings / visitors.size : null,
    },
    previous: { visitors: previousVisitors.size, pageViews: previous.rows.length },
    daily: Array.from(dailyMap, ([date, bucket]) => ({ date, visitors: bucket.visitors.size, pageViews: bucket.pageViews })),
    topPages: Array.from(pageMap, ([path, entry]) => ({ path, views: entry.views, visitors: entry.visitors.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 12),
    sources: breakdown(visitEntries, (row) => sourceLabel(row.utm_source, row.referrer_host)),
    locations: breakdown(rows, locationLabel),
    devices: breakdown(rows, (row) => row.device || 'Unknown'),
    browsers: breakdown(rows, (row) => row.browser || 'Unknown'),
    recent: rows.slice(0, 30).map((row) => ({
      createdAt: row.created_at,
      path: row.path,
      location: locationLabel(row),
      device: [row.device, row.os].filter(Boolean).join(' · ') || 'Unknown',
      source: sourceLabel(row.utm_source, row.referrer_host),
    })),
  };
}
