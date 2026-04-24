import { Metadata } from 'next';
import { getBookingServices, getPublicStoreSettings } from '@/lib/data/public';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Luxury makeup artistry for bridal, events, photoshoots, and confidence-led beauty bookings with clear services, pricing, and next steps.',
};

export default async function HomePage() {
  const store = await getPublicStoreSettings();
  const services = await getBookingServices().catch(() => []);

  return (
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
        homepage_testimonials: store.homepageTestimonials,
      }}
      services={services}
    />
  );
}
