import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { recordPageView } from '@/lib/data/analytics';
import { logEvent } from '@/lib/observability';
import { checkRateLimit } from '@/lib/rate-limit';
import { assertTrustedOrigin, getClientIp } from '@/lib/security';

const BOT_PATTERN = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch/i;

const trackSchema = z.object({
  visitorId: z.string().min(8).max(64),
  sessionId: z.string().min(8).max(64),
  path: z.string().min(1).max(300).startsWith('/'),
  referrer: z.string().max(1000).optional().default(''),
  search: z.string().max(1000).optional().default(''),
});

function deviceFromUserAgent(ua: string) {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return 'Tablet';
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

function browserFromUserAgent(ua: string) {
  if (/instagram/i.test(ua)) return 'Instagram app';
  if (/fban|fbav/i.test(ua)) return 'Facebook app';
  if (/tiktok|musical_ly|bytedance/i.test(ua)) return 'TikTok app';
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
  if (/crios|chrome\//i.test(ua)) return 'Chrome';
  if (/fxios|firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  return 'Other';
}

function osFromUserAgent(ua: string) {
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac os x|macintosh/i.test(ua)) return 'macOS';
  if (/cros/i.test(ua)) return 'ChromeOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

function externalReferrerHost(referrer: string, ownHost: string | null) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    const bare = (value: string) => value.replace(/^www\./, '');
    if (ownHost && bare(host) === bare(ownHost.toLowerCase().split(':')[0])) return null;
    return host.slice(0, 200);
  } catch {
    return null;
  }
}

function utmParam(params: URLSearchParams, name: string) {
  const value = params.get(name)?.trim();
  return value ? value.slice(0, 120).toLowerCase() : null;
}

function geoHeader(request: NextRequest, name: string) {
  const value = request.headers.get(name);
  if (!value) return null;
  try {
    return decodeURIComponent(value).slice(0, 120);
  } catch {
    return value.slice(0, 120);
  }
}

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') ?? '';
  if (!userAgent || BOT_PATTERN.test(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`analytics:${ip}`, 120, 60_000);
  if (!rateLimit.allowed) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    assertTrustedOrigin(request);
    const body = trackSchema.parse(await request.json());
    const params = new URLSearchParams(body.search);

    await recordPageView({
      visitorId: body.visitorId,
      sessionId: body.sessionId,
      path: body.path.split(/[?#]/)[0] || '/',
      referrerHost: externalReferrerHost(body.referrer, request.headers.get('host')),
      utmSource: utmParam(params, 'utm_source'),
      utmMedium: utmParam(params, 'utm_medium'),
      utmCampaign: utmParam(params, 'utm_campaign'),
      device: deviceFromUserAgent(userAgent),
      browser: browserFromUserAgent(userAgent),
      os: osFromUserAgent(userAgent),
      country: geoHeader(request, 'x-vercel-ip-country'),
      region: geoHeader(request, 'x-vercel-ip-country-region'),
      city: geoHeader(request, 'x-vercel-ip-city'),
    });
  } catch (error) {
    // Analytics must never interrupt a visitor, so failures are logged and swallowed.
    logEvent('warn', 'analytics.track_failed', {
      reason: error instanceof Error ? error.message : 'unknown',
    });
  }

  return new NextResponse(null, { status: 204 });
}
