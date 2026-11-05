'use client';

import { useEffect, useRef, useState } from 'react';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { serviceStatus } from '@/lib/service-availability';
import type { AdminBookingRow, BookingService } from '@/lib/types';
import type { RescheduleResult } from './reschedule-dialog';

export function ChangeServiceDialog({ booking, onClose, onDone }: {
  booking: AdminBookingRow;
  onClose: () => void;
  onDone: (result: RescheduleResult) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [services, setServices] = useState<BookingService[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifyClient, setNotifyClient] = useState(Boolean(booking.clientEmail));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dialog.current?.showModal();
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/admin/services', { cache: 'no-store', signal: controller.signal });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load services.');
        if (!controller.signal.aborted) setServices(json.data.services.filter((service: BookingService) => service.id !== booking.serviceId && serviceStatus(service) === 'Active'));
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Unable to load services.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [booking.serviceId]);

  const selected = services.find((service) => service.id === serviceId);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !selected) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}/service`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, notifyClient }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to change the service.');
      onDone(json);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to change the service.');
      setSaving(false);
    }
  }

  return (
    <dialog ref={dialog} aria-labelledby="change-service-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-[#C99361]/30 bg-[#1a1007] p-6 text-[#F7E7C1] shadow-2xl backdrop:bg-black/75">
      <form onSubmit={save} className="space-y-5">
        <header>
          <h2 id="change-service-title" className="font-serif text-3xl">Change service</h2>
          <p className="mt-2 text-sm text-[#e8d3bd]">{booking.clientName} · {booking.serviceName}</p>
          <p className="mt-1 text-sm text-[#e8d3bd]">{formatDateTime(booking.startsAt)} (Arizona)</p>
        </header>
        {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</p>}
        <label className="block text-sm">
          New service
          <select required value={serviceId} disabled={loading || saving} onChange={(event) => { setServiceId(event.target.value); setError(null); }}
            className="mt-2 w-full rounded-xl border border-[#C99361]/30 bg-[#140d05] p-3 text-[#F7E7C1]">
            <option value="">{loading ? 'Loading services...' : 'Choose a service'}</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name} ({service.durationMinutes} mins)</option>)}
          </select>
        </label>
        {!loading && services.length === 0 && <p className="text-sm">No alternative services are currently available. Enable another service in Services first.</p>}
        {selected && <p className="text-sm text-[#e8d3bd]">New duration: {selected.durationMinutes} minutes. Ends {formatDateTime(new Date(new Date(booking.startsAt).getTime() + selected.durationMinutes * 60_000).toISOString())}. We check for conflicts before saving.</p>}
        <div className="rounded-2xl border border-[#C99361]/20 bg-white/5 p-4 text-sm leading-6 text-[#e8d3bd]">
          The start time, artist, deposit and agreed price stay unchanged. No extra charge or refund is made.
          {booking.appointmentTotal !== null && <p>Agreed total: {formatCurrency(booking.appointmentTotal)}</p>}
          {booking.balanceDue !== null && <p>Due at appointment: {formatCurrency(booking.balanceDue)}</p>}
        </div>
        <label className="flex items-start gap-3 text-sm text-[#e8d3bd]">
          <input type="checkbox" checked={notifyClient} disabled={saving} onChange={(event) => setNotifyClient(event.target.checked)} className="mt-1" />
          Email an updated confirmation to the client and team
        </label>
        <div className="flex justify-end gap-3">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-full border border-[#C99361]/30 px-4 py-2 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={saving || loading || !selected} className="rounded-full bg-[#C99361] px-4 py-2 font-medium text-[#140d05] disabled:opacity-50">{saving ? 'Saving...' : 'Save service'}</button>
        </div>
      </form>
    </dialog>
  );
}
