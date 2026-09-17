import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, getAbsoluteUrl, normalizeCanonicalPath, BUSINESS_LOCATION } from '@/lib/site';

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
};

export function createPageMetadata(input: PageMetadataInput): Metadata {
  const canonicalPath = normalizeCanonicalPath(input.path);
  const canonicalUrl = getAbsoluteUrl(canonicalPath);
  const image = input.image ?? DEFAULT_OG_IMAGE;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${input.title} | ${SITE_NAME}`,
      description: input.description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: image, alt: input.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${input.title} | ${SITE_NAME}`,
      description: input.description,
      images: [image],
    },
  };
}

export function createLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: SITE_NAME,
    url: SITE_URL,
    image: getAbsoluteUrl(DEFAULT_OG_IMAGE),
    areaServed: [
      {
        '@type': 'State',
        name: BUSINESS_LOCATION.city,
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressRegion: BUSINESS_LOCATION.region,
      addressCountry: BUSINESS_LOCATION.country,
    },
    description:
      'itzlolabeauty is an Arizona-based makeup artist offering luxury makeup artistry and glam appointments.',
  };
}

export function createBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.path),
    })),
  };
}

export function createProductSchema(input: {
  name: string;
  description: string;
  path: string;
  image?: string | null;
  price: number;
  currency?: string;
  availability: boolean;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: input.image ? [input.image] : [getAbsoluteUrl(DEFAULT_OG_IMAGE)],
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: getAbsoluteUrl(input.path),
      priceCurrency: input.currency ?? 'USD',
      price: input.price.toFixed(2),
      availability: input.availability ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };
}
