'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, CreditCard, Mail, Trash2, UserRound } from 'lucide-react';

import { ActionIconButton } from '@/components/admin/action-icon-button';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { TruncatedText } from '@/components/admin/truncated-text';
import { Glass } from '@/components/ui/glass';
import { formatDateTime } from '@/lib/format';
import type { AdminBookingRow } from '@/lib/types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

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

  async function resendEmail(bookingId: string) {
    setEmailingId(bookingId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/email`, {
        method: 'POST',
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to resend booking email.');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Unable to resend booking email.');
    } finally {
      setEmailingId(null);
    }
  }

  async function removeRow(booking: AdminBookingRow) {
    const label = booking.entryType === 'booking' ? 'delete this booking' : 'delete this payment hold';
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;

    setRemovingId(booking.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}?entryType=${booking.entryType}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to delete booking row.');

      setBookings((current) => current.filter((item) => item.id !== booking.id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to delete booking row.');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-5 pb-10">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#8B4411]">Operations</p>
        <h1 className="mt-2 font-serif text-4xl text-[#4A2109]">Bookings</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">See confirmed appointments and unresolved payment holds in one clean operations queue.</p>
      </div>

      {error && (
        <Glass level="medium" className="p-4 text-sm text-red-600">
          {error}
        </Glass>
      )}

      <Glass level="medium" className="overflow-hidden p-0">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={`${booking.entryType}-${booking.id}`}
              className="border-b border-black/5 px-5 py-5 last:border-b-0"
            >
              <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,0.95fr)_minmax(240px,0.95fr)] xl:items-start xl:gap-5 xl:px-1">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75">Reference</p>
                  <div className="mt-2">
                    <TruncatedText value={booking.bookingReference ?? booking.reservationId ?? 'Pending'} className="font-medium leading-8 text-[#4A2109]" mono />
                  </div>
                  <div className="mt-3 inline-flex rounded-full border border-[#8B4411]/20 bg-[#f6e7d3] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#713813]">
                    {booking.entryType === 'booking' ? 'Confirmed Booking' : 'Payment Hold'}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75">Client</p>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-[rgba(139,68,17,0.12)] p-2 text-[#713813]">
                        <UserRound size={14} />
                      </div>
                      <div className="min-w-0">
                        <TruncatedText value={booking.clientName} className="text-lg font-medium text-[#4A2109]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75">Service</p>
                  <div className="mt-2">
                    <TruncatedText value={booking.serviceName} className="text-base text-[#4A2109]/90" />
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75">When / Hold</p>
                  <div className="mt-2 flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[rgba(139,68,17,0.12)] p-2 text-[var(--text-secondary)]">
                      <CalendarDays size={14} />
                    </div>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{formatDateTime(booking.startsAt)}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_170px] xl:grid-cols-1">
                  <div className="min-w-0 rounded-3xl bg-white/10 p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75">Payment</p>
                    <div className="mt-3 flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-[rgba(139,68,17,0.12)] p-2 text-[var(--text-secondary)]">
                        <CreditCard size={14} />
                      </div>
                      <div className="min-w-0">
                        <AdminStatusBadge status={booking.paymentStatus} className="max-w-full" />
                        <div className="mt-1">
                          <TruncatedText value={booking.paymentReference} fallback="Awaiting reference" className="text-xs leading-5 text-[var(--text-secondary)]" mono />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <AdminStatusBadge status={booking.status} className="text-[10px]" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75">Action</p>
                    <div className="mt-3 rounded-3xl bg-white/10 p-3">
                      {booking.entryType === 'booking' ? (
                        <>
                          <select
                            value={booking.status}
                            onChange={(event) => updateStatus(booking.id, event.target.value)}
                            className="w-full rounded-2xl bg-white/40 px-4 py-3 text-sm text-[var(--text-primary)] outline-none"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                          </select>
                          <div className="mt-3 flex items-center gap-2">
                            <ActionIconButton
                              title={booking.paymentStatus === 'paid' ? 'Resend booking email' : 'Only paid bookings can resend confirmation emails'}
                              onClick={() => resendEmail(booking.id)}
                              disabled={emailingId === booking.id || booking.paymentStatus !== 'paid'}
                            >
                              <Mail size={16} />
                            </ActionIconButton>
                            <ActionIconButton
                              title="Delete booking"
                              onClick={() => removeRow(booking)}
                              disabled={removingId === booking.id}
                              variant="danger"
                            >
                              <Trash2 size={16} />
                            </ActionIconButton>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ActionIconButton
                            title="Payment hold cannot resend confirmation email yet"
                            disabled
                          >
                            <Mail size={16} />
                          </ActionIconButton>
                          <ActionIconButton
                            title="Delete payment hold"
                            onClick={() => removeRow(booking)}
                            disabled={removingId === booking.id}
                            variant="danger"
                          >
                            <Trash2 size={16} />
                          </ActionIconButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-16 text-center text-sm text-[var(--text-secondary)]">No bookings or payment holds yet.</div>
        )}
      </Glass>
    </div>
  );
}
