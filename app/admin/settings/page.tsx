'use client';

import { useEffect, useState } from 'react';
import { Glass } from '@/components/ui/glass';
import type { HomeShopSectionItem, StoreSettings } from '@/lib/types';
import { applyStoreSettingsDefaults, createDefaultStoreSettings } from '@/lib/store-settings';

type SettingsState = StoreSettings;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/settings');
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load settings.');
        setSettings(applyStoreSettingsDefaults(json.settings ?? createDefaultStoreSettings()));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load settings.');
      }
    }

    void load();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: settings.store_name,
          supportEmail: settings.support_email,
          supportPhone: settings.support_phone,
          bookingContactEmail: settings.booking_contact_email,
          announcementBar: settings.announcement_bar,
          homeFavoritesEnabled: settings.home_favorites_enabled,
          homeShopSectionTitle: settings.home_shop_section_title,
          homeShopSectionLinkLabel: settings.home_shop_section_link_label,
          homeShopSectionLinkHref: settings.home_shop_section_link_href,
          homeShopSectionItems: settings.home_shop_section_items,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to save settings.');
      setSettings(applyStoreSettingsDefaults(json.settings));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (!settings && !error) {
    return <div className="h-72 animate-pulse rounded-3xl bg-black/5 dark:bg-white/5" />;
  }

  if (!settings) {
    return <Glass level="heavy" className="p-8 text-center text-[var(--text-secondary)]">{error ?? 'Unable to load settings.'}</Glass>;
  }

  function updateShopItem(index: number, patch: Partial<HomeShopSectionItem>) {
    setSettings((current) => {
      if (!current) return current;

      return {
        ...current,
        home_shop_section_items: current.home_shop_section_items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
      };
    });
  }

  function addShopItem() {
    setSettings((current) => {
      if (!current) return current;

      return {
        ...current,
        home_shop_section_items: [
          ...current.home_shop_section_items,
          {
            title: '',
            description: '',
          },
        ],
      };
    });
  }

  function removeShopItem(index: number) {
    setSettings((current) => {
      if (!current) return current;

      return {
        ...current,
        home_shop_section_items: current.home_shop_section_items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }

  return (
    <Glass level="medium" className="max-w-4xl p-6">
      <h1 className="font-serif text-3xl text-[#1A1008] dark:text-[#F0D080]">Settings</h1>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <input value={settings.store_name} onChange={(event) => setSettings({ ...settings, store_name: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Store name" />
        <input value={settings.support_email} onChange={(event) => setSettings({ ...settings, support_email: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Support email" />
        <input value={settings.support_phone ?? ''} onChange={(event) => setSettings({ ...settings, support_phone: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Support phone" />
        <input value={settings.booking_contact_email ?? ''} onChange={(event) => setSettings({ ...settings, booking_contact_email: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Booking contact email" />
        <textarea value={settings.announcement_bar ?? ''} onChange={(event) => setSettings({ ...settings, announcement_bar: event.target.value })} className="min-h-28 w-full rounded-3xl bg-white/40 px-5 py-4 outline-none dark:bg-black/40" placeholder="Announcement bar text" />
        <label className="flex items-center justify-between gap-4 rounded-3xl border border-black/10 bg-white/50 px-5 py-4 text-sm text-[var(--text-primary)] dark:border-white/10 dark:bg-black/40">
          <span>Show favorite items on home</span>
          <input
            type="checkbox"
            checked={settings.home_favorites_enabled}
            onChange={(event) => setSettings({ ...settings, home_favorites_enabled: event.target.checked })}
            className="h-4 w-4"
          />
        </label>
        <div className="space-y-4 rounded-3xl border border-black/10 p-5 dark:border-white/10">
          <div>
            <h2 className="font-serif text-2xl text-[#1A1008] dark:text-white">Homepage Shop Section</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Edit the title, button, and cards shown in the shop block on the homepage.</p>
          </div>
          <input value={settings.home_shop_section_title ?? ''} onChange={(event) => setSettings({ ...settings, home_shop_section_title: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Section title" />
          <input value={settings.home_shop_section_link_label ?? ''} onChange={(event) => setSettings({ ...settings, home_shop_section_link_label: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Button label" />
          <input value={settings.home_shop_section_link_href ?? ''} onChange={(event) => setSettings({ ...settings, home_shop_section_link_href: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Button link (example: /shop)" />

          <div className="space-y-4">
            {settings.home_shop_section_items.map((item, index) => (
              <div key={index} className="space-y-3 rounded-3xl bg-white/20 p-4 dark:bg-black/20">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Card {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeShopItem(index)}
                    disabled={settings.home_shop_section_items.length <= 1}
                    className="rounded-full border border-black/10 px-4 py-2 text-sm transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10"
                  >
                    Remove
                  </button>
                </div>
                <input value={item.title} onChange={(event) => updateShopItem(index, { title: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Card title" />
                <textarea value={item.description} onChange={(event) => updateShopItem(index, { description: event.target.value })} className="min-h-28 w-full rounded-3xl bg-white/40 px-5 py-4 outline-none dark:bg-black/40" placeholder="Card description" />
              </div>
            ))}
          </div>

          <button type="button" onClick={addShopItem} className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium transition-opacity hover:opacity-80 dark:border-white/10">
            Add Card
          </button>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button type="submit" disabled={saving} className="rounded-full bg-[#8B6914] px-6 py-3 font-medium text-white dark:bg-[#D4A847] dark:text-[#1A1008]">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </Glass>
  );
}
