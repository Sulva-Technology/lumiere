'use client';

import { useEffect, useState } from 'react';
import { Glass } from '@/components/ui/glass';

interface SettingsState {
  store_name: string;
  support_email: string;
  support_phone: string | null;
  booking_contact_email: string | null;
  announcement_bar: string | null;
}

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
        setSettings(
          json.settings ?? {
            store_name: "theDMAshop",
            support_email: '',
            support_phone: '',
            booking_contact_email: '',
            announcement_bar: '',
          }
        );
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
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to save settings.');
      setSettings(json.settings);
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

  return (
    <Glass level="medium" className="max-w-4xl p-6">
      <h1 className="font-serif text-3xl text-[#1A1008] dark:text-[#F0D080]">Settings</h1>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <input value={settings.store_name} onChange={(event) => setSettings({ ...settings, store_name: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Store name" />
        <input value={settings.support_email} onChange={(event) => setSettings({ ...settings, support_email: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Support email" />
        <input value={settings.support_phone ?? ''} onChange={(event) => setSettings({ ...settings, support_phone: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Support phone" />
        <input value={settings.booking_contact_email ?? ''} onChange={(event) => setSettings({ ...settings, booking_contact_email: event.target.value })} className="w-full rounded-full bg-white/40 px-5 py-3 outline-none dark:bg-black/40" placeholder="Booking contact email" />
        <textarea value={settings.announcement_bar ?? ''} onChange={(event) => setSettings({ ...settings, announcement_bar: event.target.value })} className="min-h-28 w-full rounded-3xl bg-white/40 px-5 py-4 outline-none dark:bg-black/40" placeholder="Announcement bar text" />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button type="submit" disabled={saving} className="rounded-full bg-[#8B6914] px-6 py-3 font-medium text-white dark:bg-[#D4A847] dark:text-[#1A1008]">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </Glass>
  );
}


