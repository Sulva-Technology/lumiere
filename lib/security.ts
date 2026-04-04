import type { NextRequest, NextResponse } from 'next/server';
import { getAbsoluteUrl } from '@/lib/site';

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

  const allowedOrigins = new Set([getAbsoluteUrl('/').replace(/\/$/, ''), 'http://localhost:3000']);
  if (!allowedOrigins.has(origin)) {
    throw new Error('Untrusted request origin.');
  }
}
