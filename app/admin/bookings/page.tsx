'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, CreditCard, UserRound } from 'lucide-react';

import { Glass } from '@/components/ui/glass';
import { formatDateTime } from '@/lib/format';
import type { AdminBookingRow } from '@/lib/types';

function prettifyStatus(value: string) {
  return value.replace(/_/g, ' ');
}

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
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={`${booking.entryType}-${booking.id}`}
              className="border-b border-[#6d4a13]/18 px-5 py-5 last:border-b-0"
            >
              <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(220px,0.9fr)] xl:items-start xl:gap-6 xl:px-1">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Reference</p>
                  <p className="mt-2 break-words font-medium leading-8 text-white">
                    {booking.bookingReference ?? booking.reservationId ?? 'Pending'}
                  </p>
                  <div className="mt-3 inline-flex rounded-full border border-[#6d4a13]/45 bg-[#20150a] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#F0D080]">
                    {booking.entryType === 'booking' ? 'Confirmed Booking' : 'Payment Hold'}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Client</p>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-[rgba(212,168,71,0.12)] p-2 text-[#D4A847]">
                        <UserRound size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="break-words text-lg font-medium text-white">{booking.clientName}</p>
                        <p className="text-sm text-white/55">{booking.stylistName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Service</p>
                  <p className="mt-2 break-words text-base text-white/85">{booking.serviceName}</p>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">When / Hold</p>
                  <div className="mt-2 flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-white/5 p-2 text-white/60">
                      <CalendarDays size={14} />
                    </div>
                    <p className="text-sm leading-6 text-white/70">{formatDateTime(booking.startsAt)}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-1">
                  <div className="min-w-0 rounded-3xl border border-[#6d4a13]/30 bg-[#171008] p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Payment</p>
                    <div className="mt-3 flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-white/5 p-2 text-white/60">
                        <CreditCard size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium capitalize text-white/85">{prettifyStatus(booking.paymentStatus)}</p>
                        <p className="mt-1 break-all text-xs leading-5 text-white/45">{booking.paymentReference ?? 'Awaiting reference'}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                        {prettifyStatus(booking.status)}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Action</p>
                    <div className="mt-3">
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
                </div>
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
