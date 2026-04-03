'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Plus, Repeat, Trash2 } from 'lucide-react';
import { Glass } from '@/components/ui/glass';
import { formatDateTime } from '@/lib/format';
import type { AvailabilityRule, BookingService, StylistSummary } from '@/lib/types';

interface AvailabilitySlot {
  id: string;
  starts_at: string;
  ends_at: string;
  is_available: boolean;
  has_booking: boolean;
  is_reserved: boolean;
  booking_services: { name: string } | null;
  stylists: { name: string } | null;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminAvailabilityPage() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [services, setServices] = useState<BookingService[]>([]);
  const [stylists, setStylists] = useState<StylistSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [creatingSlot, setCreatingSlot] = useState(false);

  const [ruleServiceId, setRuleServiceId] = useState('');
  const [ruleWeekday, setRuleWeekday] = useState('3');
  const [ruleStartTime, setRuleStartTime] = useState('13:00');
  const [ruleEndTime, setRuleEndTime] = useState('16:00');
  const [creatingRule, setCreatingRule] = useState(false);

  const primaryStylistId = stylists[0]?.id ?? '';
  const activeRules = useMemo(() => rules.filter((rule) => rule.active), [rules]);

  async function loadData() {
    try {
      const [availabilityRes, rulesRes, servicesRes, stylistsRes] = await Promise.all([
        fetch('/api/admin/availability'),
        fetch('/api/admin/availability/rules'),
        fetch('/api/admin/services'),
        fetch('/api/booking/stylists'),
      ]);

      const [availabilityJson, rulesJson, servicesJson, stylistsJson] = await Promise.all([
        availabilityRes.json(),
        rulesRes.json(),
        servicesRes.json(),
        stylistsRes.json(),
      ]);

      if (!availabilityRes.ok) throw new Error(availabilityJson.error ?? 'Failed to load availability.');
      if (!rulesRes.ok) throw new Error(rulesJson.error ?? 'Failed to load recurring availability.');
      if (!servicesRes.ok) throw new Error(servicesJson.error ?? 'Failed to load services.');
      if (!stylistsRes.ok) throw new Error(stylistsJson.error ?? 'Failed to load artists.');

      setAvailability(availabilityJson.data.availability);
      setRules(rulesJson.data.rules);
      setServices(servicesJson.data.services);
      setStylists(stylistsJson.stylists);
      setRuleServiceId((current) => current || servicesJson.data.services[0]?.id || '');
      setSelectedService((current) => current || servicesJson.data.services[0]?.id || '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load availability.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateSlot(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedService || !date || !time || !primaryStylistId) return;

    setCreatingSlot(true);
    setError(null);
    try {
      const service = services.find((item) => item.id === selectedService);
      if (!service) throw new Error('Service not found.');

      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stylistId: primaryStylistId,
          serviceId: selectedService,
          startsAt: new Date(`${date}T${time}`).toISOString(),
          durationMinutes: service.durationMinutes,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Failed to create slot.');

      await loadData();
      setDate('');
      setTime('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to create slot.');
    } finally {
      setCreatingSlot(false);
    }
  }

  async function handleDeleteSlot(id: string) {
    try {
      const response = await fetch(`/api/admin/availability?id=${id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Failed to delete slot.');
      setAvailability((current) => current.filter((slot) => slot.id !== id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to delete slot.');
    }
  }

  async function handleCreateRule(event: React.FormEvent) {
    event.preventDefault();
    if (!ruleServiceId || !primaryStylistId) return;

    setCreatingRule(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/availability/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stylistId: primaryStylistId,
          serviceId: ruleServiceId,
          weekday: Number(ruleWeekday),
          startTime: ruleStartTime,
          endTime: ruleEndTime,
          active: true,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Failed to save recurring availability.');

      await loadData();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to save recurring availability.');
    } finally {
      setCreatingRule(false);
    }
  }

  async function handleDeleteRule(id: string) {
    try {
      const response = await fetch(`/api/admin/availability/rules?id=${id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Failed to delete recurring availability.');
      setRules((current) => current.filter((rule) => rule.id !== id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to delete recurring availability.');
    }
  }

  if (loading) return <div className="p-8 text-center">Loading availability dashboard...</div>;

  return (
    <div className="space-y-8 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl font-medium text-[#1A1008] dark:text-[#F0D080]">Manage Availability</h1>
        <p className="text-[var(--text-secondary)]">Add one-off slots or save repeating weekly availability for itzlolabeauty.</p>
      </header>

      {error && <div className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">{error}</div>}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_1fr]">
        <Glass level="medium" className="p-6">
          <div className="mb-6 flex items-center gap-2 font-serif text-xl text-[#1A1008] dark:text-white">
            <Plus size={20} className="text-[#8B6914] dark:text-[#D4A847]" />
            <h2>Add One Slot</h2>
          </div>
          <form onSubmit={handleCreateSlot} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Service</label>
              <select value={selectedService} onChange={(event) => setSelectedService(event.target.value)} required className="w-full rounded-2xl bg-white/40 px-4 py-3 text-sm outline-none dark:bg-black/40">
                <option value="">Select a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.durationMinutes}m)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="w-full rounded-2xl bg-white/40 py-3 pl-10 pr-4 text-sm outline-none dark:bg-black/40" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Start Time</label>
              <div className="relative">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required className="w-full rounded-2xl bg-white/40 py-3 pl-10 pr-4 text-sm outline-none dark:bg-black/40" />
              </div>
            </div>
            <button type="submit" disabled={creatingSlot} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8B6914] py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-[#D4A847] dark:text-[#1A1008]">
              {creatingSlot ? 'Creating...' : 'Create Availability Slot'}
            </button>
          </form>
        </Glass>

        <Glass level="medium" className="p-6">
          <div className="mb-6 flex items-center gap-2 font-serif text-xl text-[#1A1008] dark:text-white">
            <Repeat size={20} className="text-[#8B6914] dark:text-[#D4A847]" />
            <h2>Set Weekly Availability</h2>
          </div>
          <form onSubmit={handleCreateRule} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Service</label>
              <select value={ruleServiceId} onChange={(event) => setRuleServiceId(event.target.value)} required className="w-full rounded-2xl bg-white/40 px-4 py-3 text-sm outline-none dark:bg-black/40">
                <option value="">Select a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Weekday</label>
              <select value={ruleWeekday} onChange={(event) => setRuleWeekday(event.target.value)} className="w-full rounded-2xl bg-white/40 px-4 py-3 text-sm outline-none dark:bg-black/40">
                {WEEKDAYS.map((weekday, index) => (
                  <option key={weekday} value={index}>
                    {weekday}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Start Time</label>
                <input type="time" value={ruleStartTime} onChange={(event) => setRuleStartTime(event.target.value)} required className="w-full rounded-2xl bg-white/40 px-4 py-3 text-sm outline-none dark:bg-black/40" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">End Time</label>
                <input type="time" value={ruleEndTime} onChange={(event) => setRuleEndTime(event.target.value)} required className="w-full rounded-2xl bg-white/40 px-4 py-3 text-sm outline-none dark:bg-black/40" />
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">This creates a repeating weekly rule and automatically fills future bookable slots ahead for that window.</p>
            <button type="submit" disabled={creatingRule} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1A1008] py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-[#1A1008]">
              {creatingRule ? 'Saving rule...' : 'Save Weekly Availability'}
            </button>
          </form>
        </Glass>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <Glass level="medium" className="p-6">
          <h2 className="font-serif text-xl text-[#1A1008] dark:text-white">Weekly Rules</h2>
          <div className="mt-6 space-y-3">
            {activeRules.length > 0 ? (
              activeRules.map((rule) => {
                const service = services.find((item) => item.id === rule.serviceId);
                return (
                  <div key={rule.id} className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/30 p-4 dark:border-white/10 dark:bg-black/20">
                    <div>
                      <p className="font-medium text-[#1A1008] dark:text-white">{service?.name ?? 'Service'}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {WEEKDAYS[rule.weekday]} · {rule.startTime} to {rule.endTime}
                      </p>
                    </div>
                    <button type="button" onClick={() => void handleDeleteRule(rule.id)} className="rounded-full p-2 text-red-500 transition-colors hover:bg-red-500/10">
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="rounded-2xl bg-white/30 p-4 text-sm text-[var(--text-secondary)] dark:bg-black/20">No weekly availability rules yet.</p>
            )}
          </div>
        </Glass>

        <Glass level="medium" className="p-6">
          <h2 className="font-serif text-xl text-[#1A1008] dark:text-white">Upcoming Slots</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] dark:border-white/10">
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {availability.length > 0 ? (
                  availability.map((slot) => (
                    <tr key={slot.id} className="border-b border-black/5 text-sm dark:border-white/5 last:border-0">
                      <td className="py-4 font-medium text-[#1A1008] dark:text-white">{slot.booking_services?.name || 'Unknown Service'}</td>
                      <td className="py-4 text-[var(--text-secondary)]">{formatDateTime(slot.starts_at)}</td>
                      <td className="py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${slot.has_booking ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : slot.is_reserved ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {slot.has_booking ? 'Booked' : slot.is_reserved ? 'Reserved' : 'Available'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button onClick={() => void handleDeleteSlot(slot.id)} className="p-2 text-red-500 transition-colors hover:text-red-700" title="Delete Slot">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[var(--text-secondary)]">No availability slots found yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Glass>
      </div>
    </div>
  );
}
