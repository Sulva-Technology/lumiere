import type { NextRequest, NextResponse } from 'next/server';
import { getAbsoluteUrl, getConfiguredSiteOrigin, getOriginFromHeaders } from '@/lib/site';

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, '').toLowerCase();
}

function withAlternateWww(origin: string) {
  try {
    const url = new URL(origin);
    const normalized = normalizeOrigin(url.origin);
    const hostname = url.hostname.toLowerCase();

    if (hostname === 'localhost' || hostname.startsWith('127.')) {
      return [normalized];
    }

    const alternate = new URL(url.origin);
    alternate.hostname = hostname.startsWith('www.') ? hostname.slice(4) : `www.${hostname}`;

    return Array.from(new Set([normalized, normalizeOrigin(alternate.origin)]));
  } catch {
    return [normalizeOrigin(origin)];
  }
}

function getAllowedOrigins(request: NextRequest | Request) {
  const requestOrigin = getOriginFromHeaders(request.headers);
  const configuredOrigin = getConfiguredSiteOrigin();
  const origins = new Set<string>();

  for (const origin of [
    configuredOrigin,
    requestOrigin,
    getAbsoluteUrl('/').replace(/\/$/, ''),
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]) {
    if (!origin) continue;

    for (const candidate of withAlternateWww(origin)) {
      origins.add(candidate);
    }
  }

  return origins;
}

export function getClientIp(request: NextRequest | Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export function applySecurityHeaders(response: NextResponse) {
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https: data:",
      "style-src 'self' 'unsafe-inline' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "connect-src 'self' https:",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "form-action 'self' https://checkout.stripe.com",
      'upgrade-insecure-requests',
    ].join('; ')
  );
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

export function assertTrustedOrigin(request: NextRequest | Request) {
  const origin = request.headers.get('origin');
  if (!origin) return;

  const normalizedOrigin = normalizeOrigin(origin);
  const allowedOrigins = getAllowedOrigins(request);
  if (!allowedOrigins.has(normalizedOrigin)) {
    throw new Error('Untrusted request origin.');
  }
}
