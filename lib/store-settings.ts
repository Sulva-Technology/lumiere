import type { HomeShopSectionItem, HomeTestimonialItem, StoreSettings } from '@/lib/types';

export const defaultHomeShopSectionItems: HomeShopSectionItem[] = [
  {
    title: 'Beauty Led by Vision',
    description: 'Every product and appointment is curated to help clients feel confident, seen, and ready for the moment in front of them.',
  },
  {
    title: 'Founder Guided Experience',
    description: 'Move from booking to confirmation through a refined studio flow shaped by the creative direction behind itzlolabeauty.',
  },
];

export const defaultHomepageTestimonials: HomeTestimonialItem[] = [
  {
    quote:
      'My glam looked flawless in person and even better in photos. The whole appointment felt calm, polished, and worth every minute.',
    name: 'Arielle M.',
    context: 'Birthday glam client',
  },
  {
    quote:
      'I loved how clear the booking process was. I knew exactly what I was booking, what it would cost, and how to prepare.',
    name: 'Nicole T.',
    context: 'Event makeup client',
  },
  {
    quote:
      'Professional, warm, and reliable from inquiry to final look. I felt taken care of the entire time.',
    name: 'Danielle R.',
    context: 'Bridal inquiry client',
  },
];

export function createDefaultStoreSettings(): StoreSettings {
  return {
    store_name: 'itzlolabeauty',
    support_email: '',
    support_phone: '',
    booking_contact_email: '',
    announcement_bar: '',
    home_favorites_enabled: true,
    home_shop_section_title: 'Shop',
    home_shop_section_link_label: 'Shop Collection',
    home_shop_section_link_href: '/shop',
    home_shop_section_items: defaultHomeShopSectionItems,
    homepage_testimonials: defaultHomepageTestimonials,
  };
}

export function applyStoreSettingsDefaults(settings: Partial<StoreSettings> | null | undefined): StoreSettings {
  const defaults = createDefaultStoreSettings();

  return {
    ...defaults,
    ...settings,
    store_name: settings?.store_name?.trim() || defaults.store_name,
    support_email: settings?.support_email?.trim() || defaults.support_email,
    support_phone: settings?.support_phone?.trim() || defaults.support_phone,
    booking_contact_email: settings?.booking_contact_email?.trim() || defaults.booking_contact_email,
    announcement_bar: settings?.announcement_bar?.trim() || defaults.announcement_bar,
    home_favorites_enabled: settings?.home_favorites_enabled ?? defaults.home_favorites_enabled,
    home_shop_section_title: settings?.home_shop_section_title?.trim() || defaults.home_shop_section_title,
    home_shop_section_link_label: settings?.home_shop_section_link_label?.trim() || defaults.home_shop_section_link_label,
    home_shop_section_link_href: settings?.home_shop_section_link_href?.trim() || defaults.home_shop_section_link_href,
    home_shop_section_items: settings?.home_shop_section_items?.length ? settings.home_shop_section_items : defaults.home_shop_section_items,
    homepage_testimonials: settings?.homepage_testimonials?.length ? settings.homepage_testimonials : defaults.homepage_testimonials,
  };
}
