'use client';

import { useEffect, useState } from 'react';
import { Glass } from '@/components/ui/glass';
import { formatDateTime } from '@/lib/format';
import type { AdminBookingRow } from '@/lib/types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/bookings');
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load bookings.');
        setBookings(json.bookings);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load bookings.');
      }
    }

    void load();
  }, []);

  async function updateStatus(bookingId: string, status: string) {
    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error ?? 'Unable to update booking.');
      return;
    }
    setBookings((current) => current.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)));
  }

  return (
    <Glass level="medium" className="overflow-hidden p-6">
      <h1 className="font-serif text-3xl text-[#1A1008] dark:text-[#F0D080]">Bookings</h1>
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] dark:border-white/10">
              <th className="pb-3">Reference</th>
              <th className="pb-3">Client</th>
              <th className="pb-3">Stylist</th>
              <th className="pb-3">Service</th>
              <th className="pb-3">Start</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-black/5 text-sm dark:border-white/5">
                <td className="py-4 font-medium text-[#1A1008] dark:text-white">{booking.bookingReference}</td>
                <td className="py-4">{booking.clientName}</td>
                <td className="py-4">{booking.stylistName}</td>
                <td className="py-4">{booking.serviceName}</td>
                <td className="py-4 text-[var(--text-secondary)]">{formatDateTime(booking.startsAt)}</td>
                <td className="py-4">
                  <select
                    value={booking.status}
                    onChange={(event) => updateStatus(booking.id, event.target.value)}
                    className="rounded-full bg-white/40 px-4 py-2 text-sm outline-none dark:bg-black/40"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Glass>
  );
}
