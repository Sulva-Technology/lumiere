export const SITE_URL = 'https://itzlolabeauty.com';
export const SITE_NAME = 'itzlolabeauty';
export const DEFAULT_OG_IMAGE = '/images/logo.jpeg';
export const BUSINESS_LOCATION = {
  city: 'Arizona',
  region: 'AZ',
  country: 'US',
};

export function getAbsoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}

export function normalizeCanonicalPath(path: string) {
  if (!path.startsWith('/')) return `/${path}`;
  return path;
}
