const VISITOR_KEY = 'ilb-visitor-id';
const SESSION_KEY = 'ilb-visit';
const IGNORE_KEY = 'ilb-analytics-ignore';
const SESSION_IDLE_MS = 30 * 60 * 1000;

let fallbackVisitorId: string | null = null;
let fallbackSessionId: string | null = null;
let lastTracked: { path: string; at: number } | null = null;

function randomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const created = randomId();
    localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch {
    fallbackVisitorId ??= randomId();
    return fallbackVisitorId;
  }
}

/** A visit ends after 30 minutes without a page view. */
function getSessionId() {
  const now = Date.now();
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as { id: string; lastSeen: number } | null;
    const id = stored && now - stored.lastSeen < SESSION_IDLE_MS ? stored.id : randomId();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, lastSeen: now }));
    return id;
  } catch {
    fallbackSessionId ??= randomId();
    return fallbackSessionId;
  }
}

export function isAnalyticsIgnored() {
  try {
    return localStorage.getItem(IGNORE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Lets the business owner keep their own browsing out of the numbers. */
export function setAnalyticsIgnored(ignored: boolean) {
  try {
    if (ignored) localStorage.setItem(IGNORE_KEY, '1');
    else localStorage.removeItem(IGNORE_KEY);
  } catch {
    // Storage unavailable: nothing to remember.
  }
}

export function trackPageView(path: string) {
  if (typeof window === 'undefined' || isAnalyticsIgnored()) return;

  // Ignore the duplicate effect run React makes in development.
  const now = Date.now();
  if (lastTracked && lastTracked.path === path && now - lastTracked.at < 1000) return;
  lastTracked = { path, at: now };

  const body = JSON.stringify({
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    path,
    referrer: document.referrer,
    search: window.location.search,
  });

  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics never blocks or alerts a visitor.
  });
}
