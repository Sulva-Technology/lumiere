import { Metadata } from 'next';
import { getProducts, getPublicStoreSettings } from '@/lib/data/public';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Home',
  description: 'The definitive studio for high-end makeup artistry and professional digital content creation. Experience the new standard in creative storytelling.',
};

export default async function HomePage() {
  const [products, store] = await Promise.all([getProducts(), getPublicStoreSettings()]);
  const favoriteItems = products.filter((product) => product.featured).slice(0, 3);
  return (
    <HomeClient
      favoriteItems={favoriteItems}
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
  );
}
