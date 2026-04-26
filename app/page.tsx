import { Metadata } from 'next';
import { getPublicStoreSettings } from '@/lib/data/public';
import HomeClient from './home-client';
import { JsonLd } from '@/components/seo/JsonLd';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Makeup Artist in Arizona | Luxury Glam & Content Studio',
  description: 'Top-rated makeup artist in Arizona specializing in Soft Glam, Full Glam, and Bridal makeup. Professional studio for photoshoots, events, and content creation.',
};

export default async function HomePage() {
  const store = await getPublicStoreSettings();
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
            'description': 'Soft Glam, Full Glam, and Bridal makeup services tailored for photoshoots, events, and weddings.',
            'provider': { '@id': `${siteUrl}/#salon` },
            'url': `${siteUrl}/book?type=makeup`
          },
          {
            '@type': 'Service',
            'name': 'Content Creation Session',
            'description': 'Professional vertical video, brand photography, and social storytelling for creators and brands.',
            'provider': { '@id': `${siteUrl}/#salon` },
            'url': `${siteUrl}/book?type=content`
          }
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
          home_favorites_enabled: store.homeFavoritesEnabled,
          home_shop_section_title: store.homeShopSectionTitle,
          home_shop_section_link_label: store.homeShopSectionLinkLabel,
          home_shop_section_link_href: store.homeShopSectionLinkHref,
          home_shop_section_items: store.homeShopSectionItems,
        }}
      />
    </>
  );
}
