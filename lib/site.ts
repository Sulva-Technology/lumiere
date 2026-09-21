export const SITE_URL = 'https://itzlolabeauty.com';
export const SITE_NAME = 'itzlolabeauty';
export const DEFAULT_OG_IMAGE = '/images/logo.jpeg';
export const BUSINESS_LOCATION = {
  city: 'Arizona',
  region: 'AZ',
  country: 'US',
};

function normalizeOrigin(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getConfiguredSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_URL;
}

export function getConfiguredSiteOrigin() {
  return normalizeOrigin(getConfiguredSiteUrl()) ?? normalizeOrigin(SITE_URL) ?? 'http://localhost:3000';
}

export function getOriginFromHeaders(headersLike: Pick<Headers, 'get'>) {
  const forwardedProto = headersLike.get('x-forwarded-proto');
  const forwardedHost = headersLike.get('x-forwarded-host') ?? headersLike.get('host');
  const origin = normalizeOrigin(headersLike.get('origin'));

  if (forwardedProto && forwardedHost) {
    return normalizeOrigin(`${forwardedProto}://${forwardedHost}`) ?? origin;
  }

  return origin;
}

export function getAbsoluteUrl(path = '/') {
  return new URL(path, getConfiguredSiteUrl()).toString();
}

export function normalizeCanonicalPath(path: string) {
  if (!path.startsWith('/')) return `/${path}`;
  return path;
}
