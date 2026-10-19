import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/seo/JsonLd';
import { getPublicGallery, getPublicStoreSettings } from '@/lib/data/public';
import GalleryClient from './gallery-client';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Makeup Portfolio Gallery',
  description: 'Browse Soft Glam, Full Glam, bridal and event makeup looks by Itz Lola Beauty in Arizona, then book the look you love.',
  alternates: { canonical: '/gallery' },
};

export default async function GalleryPage() {
  const [store, gallery] = await Promise.all([getPublicStoreSettings(), getPublicGallery()]);

  // The "Portfolio gallery" switch in admin settings hides the whole gallery experience.
  if (!store.homeSectionVisibility.gallery || gallery.length === 0) {
    notFound();
  }

  const siteUrl = 'https://itzlolabeauty.com';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: `${store.storeName} makeup portfolio`,
    url: `${siteUrl}/gallery`,
    image: gallery.map((item) => ({
      '@type': 'ImageObject',
      contentUrl: item.imageUrl.startsWith('http') ? item.imageUrl : `${siteUrl}${item.imageUrl}`,
      name: item.title ?? undefined,
      description: item.alt,
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <GalleryClient items={gallery} />
    </>
  );
}
