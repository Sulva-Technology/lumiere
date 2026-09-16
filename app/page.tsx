import { Metadata } from 'next';
import { getPublicGallery, getPublicStoreSettings } from '@/lib/data/public';
import HomeClient from './home-client';
import { JsonLd } from '@/components/seo/JsonLd';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Makeup Artist in Arizona | Luxury Glam',
  description: 'Luxury Soft Glam and Full Glam makeup appointments for events, birthdays, photoshoots, and everyday confidence.',
};

export default async function HomePage() {
  const [store, gallery] = await Promise.all([getPublicStoreSettings(), getPublicGallery()]);
  const siteUrl = 'https://itzlolabeauty.com';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': siteUrl
          }
        ]
      },
      {
        '@type': 'ItemList',
        'name': 'Studio Services',
        'itemListElement': [
          {
            '@type': 'Service',
            'name': 'Luxury Makeup Artistry',
            'description': 'Soft Glam and Full Glam makeup services tailored for photoshoots and events.',
            'provider': { '@id': `${siteUrl}/#salon` },
            'url': `${siteUrl}/book?type=makeup`
          },
        ]
      }
    ]
  };

  return (
    <>
      <JsonLd data={schema} />
      <HomeClient
        settings={{
          store_name: store.storeName,
          support_email: store.supportEmail,
          support_phone: store.supportPhone,
          booking_contact_email: store.bookingContactEmail,
          announcement_bar: store.announcementBar,
          travel_fee: store.travelFee,
          home_favorites_enabled: store.homeFavoritesEnabled,
          home_shop_section_title: store.homeShopSectionTitle,
          home_shop_section_link_label: store.homeShopSectionLinkLabel,
          home_shop_section_link_href: store.homeShopSectionLinkHref,
          home_shop_section_items: store.homeShopSectionItems,
          home_section_visibility: store.homeSectionVisibility,
        }}
        gallery={gallery}
      />
    </>
  );
}
