import type { HomeShopSectionItem, StoreSettings } from '@/lib/types';

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
  };
}
