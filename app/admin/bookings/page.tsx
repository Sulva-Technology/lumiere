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
    <div className="space-y-5 pb-10">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#D4A847]">Operations</p>
        <h1 className="mt-2 font-serif text-4xl text-[#F7E7C1]">Bookings</h1>
        <p className="mt-2 text-sm text-white/60">See confirmed appointments and unresolved payment holds in one clean operations queue.</p>
      </div>

      {error && (
        <Glass level="medium" className="border border-red-500/20 p-4 text-sm text-red-300">
          {error}
        </Glass>
      )}

      <Glass level="medium" className="overflow-hidden border border-[#6d4a13]/35 bg-[#1a1108] p-0">
        <div className="hidden grid-cols-[1fr_1.2fr_0.9fr_1.1fr_1fr_0.9fr_0.9fr] gap-6 border-b border-[#6d4a13]/25 px-6 py-5 text-xs uppercase tracking-[0.24em] text-white/40 xl:grid">
          <span>Reference</span>
          <span>Client</span>
          <span>Service</span>
          <span>When / Hold</span>
          <span>Payment</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={`${booking.entryType}-${booking.id}`} className="border-b border-[#6d4a13]/18 px-5 py-5 last:border-b-0 xl:grid xl:grid-cols-[1fr_1.2fr_0.9fr_1.1fr_1fr_0.9fr_0.9fr] xl:items-center xl:gap-6 xl:px-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Reference</p>
                <p className="mt-1 font-medium text-white xl:mt-0">{booking.bookingReference ?? booking.reservationId ?? 'Pending'}</p>
              </div>
              <div className="mt-4 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Client</p>
                <p className="mt-1 text-white xl:mt-0">{booking.clientName}</p>
                <p className="text-sm text-white/55">{booking.stylistName}</p>
              </div>
              <div className="mt-4 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Service</p>
                <p className="mt-1 text-white/80 xl:mt-0">{booking.serviceName}</p>
              </div>
              <div className="mt-4 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">When / Hold</p>
                <p className="mt-1 text-sm text-white/65 xl:mt-0">{formatDateTime(booking.startsAt)}</p>
              </div>
              <div className="mt-4 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Payment</p>
                <p className="mt-1 text-white/80 xl:mt-0">{booking.paymentStatus}</p>
                <p className="text-xs text-white/45">{booking.paymentReference ?? 'Awaiting reference'}</p>
              </div>
              <div className="mt-4 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Status</p>
                <p className="mt-1 text-white/80 xl:mt-0">{booking.status}</p>
              </div>
              <div className="mt-4 xl:mt-0">
                {booking.entryType === 'booking' ? (
                  <select
                    value={booking.status}
                    onChange={(event) => updateStatus(booking.id, event.target.value)}
                    className="w-full rounded-full border border-[#6d4a13]/50 bg-[#140d05] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#D4A847]"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                ) : (
                  <span className="inline-flex rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/55">Monitor</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-16 text-center text-sm text-white/60">No bookings or payment holds yet.</div>
        )}
      </Glass>
    </div>
  );
}
