'use client';

import { useEffect, useState } from 'react';
import { Glass } from '@/components/ui/glass';
import { formatDateTime, formatCurrency } from '@/lib/format';
import { Plus, Trash2, Calendar, Clock, Sparkles } from 'lucide-react';
import type { BookingService, StylistSummary } from '@/lib/types';

interface AvailabilitySlot {
  id: string;
  starts_at: string;
  ends_at: string;
  is_available: boolean;
  booking_services: { name: string } | null;
  stylists: { name: string } | null;
}

export default function AdminAvailabilityPage() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [services, setServices] = useState<BookingService[]>([]);
  const [stylists, setStylists] = useState<StylistSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [availRes, servRes, styRes] = await Promise.all([
          fetch('/api/admin/availability'),
          fetch('/api/booking/services'),
          fetch('/api/booking/stylists')
        ]);

        const availData = await availRes.json();
        const servData = await servRes.json();
        const styData = await styRes.json();

        if (!availRes.ok) throw new Error(availData.error || 'Failed to load availability');
        if (!servRes.ok) throw new Error(servData.error || 'Failed to load services');
        if (!styRes.ok) throw new Error(styData.error || 'Failed to load artists');

        setAvailability(availData.availability);
        setServices(servData.services);
        setStylists(styData.stylists);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleCreateSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !date || !time) return;

    setCreating(true);
    try {
      const service = services.find(s => s.id === selectedService);
      if (!service) throw new Error('Service not found');

      const startsAt = new Date(`${date}T${time}`);
      const stylistId = stylists[0]?.id; // Always use the first artist as per user request

      if (!stylistId) throw new Error('No artist found in database');

      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stylistId,
          serviceId: selectedService,
          startsAt: startsAt.toISOString(),
          durationMinutes: service.durationMinutes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create slot');

      // Refresh availability
      const availRes = await fetch('/api/admin/availability');
      const availData = await availRes.json();
      setAvailability(availData.availability);

      // Reset form
      setSelectedService('');
      setDate('');
      setTime('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create slot');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteSlot(id: string) {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;

    try {
      const res = await fetch(`/api/admin/availability?id=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete slot');
      }

      setAvailability(prev => prev.filter(slot => slot.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete slot');
    }
  }

  if (loading) return <div className="p-8 text-center">Loading availability dashboard...</div>;

  return (
    <div className="space-y-8 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl font-medium text-[#1A1008] dark:text-[#F0D080]">Manage Availability</h1>
        <p className="text-[var(--text-secondary)]">Set your working hours and available sessions for thedmashop.</p>

      </header>

      {error && (
        <div className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_2fr]">
        {/* Create Slot Form */}
        <Glass level="medium" className="h-fit p-6">
          <div className="mb-6 flex items-center gap-2 font-serif text-xl text-[#1A1008] dark:text-white">
            <Plus size={20} className="text-[#8B6914] dark:text-[#D4A847]" />
            <h2>Add New Slot</h2>
          </div>

          <form onSubmit={handleCreateSlot} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Service</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                required
                className="w-full rounded-2xl bg-white/40 px-4 py-3 text-sm outline-none transition-colors focus:bg-white/60 dark:bg-black/40 dark:focus:bg-black/60"
              >
                <option value="">Select a service...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes}m)</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-2xl bg-white/40 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:bg-white/60 dark:bg-black/40 dark:focus:bg-black/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Start Time</label>
              <div className="relative">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full rounded-2xl bg-white/40 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:bg-white/60 dark:bg-black/40 dark:focus:bg-black/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#8B6914] py-3 font-medium text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-[#D4A847] dark:text-[#1A1008]"
            >
              {creating ? 'Creating...' : 'Create Availability Slot'}
            </button>
          </form>
        </Glass>

        {/* Slots List */}
        <Glass level="medium" className="p-6">
          <div className="mb-6 flex items-center gap-2 font-serif text-xl text-[#1A1008] dark:text-white">
            <Sparkles size={20} className="text-[#8B6914] dark:text-[#D4A847]" />
            <h2>Existing Availability</h2>
          </div>

          <div className="overflow-x-auto">
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
                  availability.map((slot) => {
                    const isPast = new Date(slot.starts_at) < new Date();
                    return (
                      <tr key={slot.id} className="border-b border-black/5 text-sm dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 font-medium text-[#1A1008] dark:text-white">
                          {slot.booking_services?.name || 'Unknown Service'}
                        </td>
                        <td className="py-4 text-[var(--text-secondary)]">
                          {formatDateTime(slot.starts_at)}
                        </td>
                        <td className="py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                            slot.is_available 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {slot.is_available ? 'Available' : 'Booked'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-red-500 hover:text-red-700 p-2 transition-colors"
                            title="Delete Slot"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[var(--text-secondary)]">
                      No availability slots found. Create one using the form on the left.
                    </td>
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
