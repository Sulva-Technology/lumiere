'use client';

import { useEffect, useMemo, useState } from 'react';
import { Glass } from '@/components/ui/glass';
import { formatCurrency } from '@/lib/format';
import type { BookingService, BookingServiceType } from '@/lib/types';

type ServiceFormState = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  durationMinutes: string;
  price: string;
  serviceType: BookingServiceType;
  active: boolean;
};

const INITIAL_FORM: ServiceFormState = {
  id: null,
  name: '',
  slug: '',
  description: '',
  durationMinutes: '60',
  price: '',
  serviceType: 'makeup',
  active: true,
};

function toSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<BookingService[]>([]);
  const [form, setForm] = useState<ServiceFormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/services');
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load services.');
        setServices(json.data.services);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load services.');
      }
    }

    void load();
  }, []);

  const activeCount = useMemo(() => services.filter((service) => service.active).length, [services]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const isEditing = Boolean(form.id);
      const response = await fetch('/api/admin/services', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          slug: form.slug,
          description: form.description,
          durationMinutes: form.durationMinutes,
          price: form.price,
          serviceType: form.serviceType,
          active: form.active,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to save service.');

      setServices((current) =>
        isEditing ? current.map((service) => (service.id === json.data.service.id ? json.data.service : service)) : [...current, json.data.service]
      );
      setForm(INITIAL_FORM);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save service.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to remove service.');
      setServices((current) => (json.data.mode === 'archived' ? current.map((service) => (service.id === id ? { ...service, active: false } : service)) : current.filter((service) => service.id !== id)));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to remove service.');
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#D4A847]">Booking Setup</p>
          <h1 className="mt-2 font-serif text-4xl text-[#F7E7C1]">Services</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">Add, edit, or retire the services people can book from the public experience.</p>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border border-[#6d4a13]/40 bg-[#1a1108] px-4 py-2 text-sm text-white/70">{activeCount} active service{activeCount === 1 ? '' : 's'}</div>
      </div>

      {error && <Glass level="medium" className="border border-red-500/20 p-4 text-sm text-red-300">{error}</Glass>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Glass level="medium" className="border border-[#6d4a13]/35 bg-[#1a1108] p-5">
          <h2 className="font-serif text-2xl text-[#F7E7C1]">{form.id ? 'Edit Service' : 'Add Service'}</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value, slug: current.slug === '' || current.slug === toSlug(current.name) ? toSlug(event.target.value) : current.slug }))} placeholder="Service name" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30" required />
            <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: toSlug(event.target.value) }))} placeholder="service-slug" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30" required />
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the service" className="min-h-28 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30" />
            <select value={form.serviceType} onChange={(event) => setForm((current) => ({ ...current, serviceType: event.target.value as BookingServiceType }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" required>
              <option value="makeup" className="bg-[#140d05] text-white">Makeup</option>
              <option value="content" className="bg-[#140d05] text-white">Content</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.durationMinutes} onChange={(event) => setForm((current) => ({ ...current, durationMinutes: event.target.value }))} type="number" min="15" step="15" placeholder="Duration" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30" required />
              <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} type="number" min="0" step="0.01" placeholder="Price" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30" required />
            </div>
            <label className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-white/70">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
              Active
            </label>
            <button type="submit" disabled={saving} className="w-full rounded-2xl bg-[#D4A847] px-5 py-3 font-medium text-[#140d05] transition-opacity hover:opacity-90 disabled:opacity-60">{saving ? 'Saving...' : form.id ? 'Save Changes' : 'Create Service'}</button>
            {form.id && <button type="button" onClick={() => setForm(INITIAL_FORM)} className="w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/5">Cancel Editing</button>}
          </form>
        </Glass>

        <div className="space-y-4">
          {services.map((service) => (
            <Glass key={service.id} level="medium" className="border border-[#6d4a13]/35 bg-[#1a1108] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
                    <span>{service.slug}</span>
                    <span>{service.serviceType}</span>
                    <span className={`rounded-full px-2 py-1 tracking-[0.18em] ${service.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/8 text-white/55'}`}>{service.active ? 'Active' : 'Hidden'}</span>
                  </div>
                  <h2 className="mt-3 font-serif text-3xl text-[#F7E7C1]">{service.name}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 whitespace-pre-wrap text-white/60">{service.description || 'No description yet.'}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/55">
                    <span className="rounded-full border border-white/10 px-3 py-1">{service.durationMinutes} mins</span>
                    <span className="rounded-full border border-white/10 px-3 py-1">{formatCurrency(service.price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setForm({ id: service.id, name: service.name, slug: service.slug, description: service.description ?? '', durationMinutes: String(service.durationMinutes), price: String(service.price), serviceType: service.serviceType, active: service.active ?? true })} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10">Edit</button>
                  <button type="button" onClick={() => void handleDelete(service.id)} className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20">Archive / Delete</button>
                </div>
              </div>
            </Glass>
          ))}
        </div>
      </div>
    </div>
  );
}
