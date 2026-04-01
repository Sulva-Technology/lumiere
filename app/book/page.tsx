'use client';

import { useEffect, useMemo, useState } from 'react';
import { Glass } from '@/components/ui/glass';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { AvailableSlot, BookingConfirmation, BookingService, StylistSummary } from '@/lib/types';

export default function BookingPage() {
  const [stylists, setStylists] = useState<StylistSummary[]>([]);
  const [services, setServices] = useState<BookingService[]>([]);
  const [availability, setAvailability] = useState<AvailableSlot[]>([]);
  const [selectedStylist, setSelectedStylist] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [servicesResponse, stylistsResponse] = await Promise.all([fetch('/api/booking/services'), fetch('/api/booking/stylists')]);
        const servicesJson = await servicesResponse.json();
        const stylistsJson = await stylistsResponse.json();
        if (!servicesResponse.ok) throw new Error(servicesJson.error ?? 'Unable to load services.');
        if (!stylistsResponse.ok) throw new Error(stylistsJson.error ?? 'Unable to load stylists.');
        setServices(servicesJson.services);
        setStylists(stylistsJson.stylists);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load booking data.');
      }
    }

    void load();
  }, []);

  useEffect(() => {
    if (!selectedStylist || !selectedService) {
      setAvailability([]);
      return;
    }

    async function loadAvailability() {
      try {
        const response = await fetch(`/api/booking/availability?stylistId=${selectedStylist}&serviceId=${selectedService}`);
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load availability.');
        setAvailability(json.availability);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load availability.');
      }
    }

    void loadAvailability();
  }, [selectedService, selectedStylist]);

  const selectedServiceDetail = useMemo(() => services.find((service) => service.id === selectedService) ?? null, [services, selectedService]);
  const selectedStylistDetail = useMemo(() => stylists.find((stylist) => stylist.id === selectedStylist) ?? null, [stylists, selectedStylist]);
  const selectedSlot = useMemo(() => availability.find((slot) => slot.id === selectedAvailability) ?? null, [availability, selectedAvailability]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stylistId: selectedStylist,
          serviceId: selectedService,
          availabilityId: selectedAvailability,
          fullName,
          email,
          phone,
          notes,
        }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to save booking.');
      setConfirmation(json.booking);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save booking.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-10 text-center">
        <h1 className="font-serif text-4xl md:text-6xl">Book Your Luxury Hair Experience</h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-[var(--text-secondary)]">
          Live stylist schedules and real availability power bookings. Choose a stylist, reserve a slot, and your appointment is saved instantly.
        </p>
      </section>

      {confirmation ? (
        <Glass level="heavy" className="mx-auto max-w-3xl p-10 text-center">
          <h2 className="font-serif text-3xl text-[#1A1008] dark:text-white">Booking Confirmed</h2>
          <p className="mt-3 text-[var(--text-secondary)]">Reference {confirmation.bookingReference}</p>
          <p className="mt-6 text-lg text-[var(--text-secondary)]">
            {confirmation.serviceName} with {confirmation.stylistName} on {formatDateTime(confirmation.startsAt)}.
          </p>
        </Glass>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Glass level="heavy" className="p-6">
              <h2 className="font-serif text-2xl text-[#1A1008] dark:text-white">Choose a stylist</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {stylists.map((stylist) => (
                  <button
                    key={stylist.id}
                    onClick={() => setSelectedStylist(stylist.id)}
                    className={`rounded-3xl border p-5 text-left transition-colors ${
                      selectedStylist === stylist.id ? 'border-[#8B6914] bg-[#8B6914]/10 dark:border-[#D4A847] dark:bg-[#D4A847]/10' : 'border-black/5 dark:border-white/5'
                    }`}
                  >
                    <p className="font-serif text-xl text-[#1A1008] dark:text-white">{stylist.name}</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{stylist.specialties.join(' • ')}</p>
                    <p className="mt-3 text-sm font-medium text-[#8B6914] dark:text-[#F0D080]">
                      {stylist.basePrice ? `From ${formatCurrency(stylist.basePrice)}` : 'Custom pricing'}
                    </p>
                  </button>
                ))}
              </div>
            </Glass>

            <Glass level="heavy" className="p-6">
              <h2 className="font-serif text-2xl text-[#1A1008] dark:text-white">Choose a service</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`rounded-3xl border p-5 text-left transition-colors ${
                      selectedService === service.id ? 'border-[#8B6914] bg-[#8B6914]/10 dark:border-[#D4A847] dark:bg-[#D4A847]/10' : 'border-black/5 dark:border-white/5'
                    }`}
                  >
                    <p className="font-serif text-xl text-[#1A1008] dark:text-white">{service.name}</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{service.durationMinutes} min</p>
                    <p className="mt-3 text-sm font-medium text-[#8B6914] dark:text-[#F0D080]">{formatCurrency(service.price)}</p>
                  </button>
                ))}
              </div>
            </Glass>

            <Glass level="heavy" className="p-6">
              <h2 className="font-serif text-2xl text-[#1A1008] dark:text-white">Choose a time</h2>
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {availability.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedAvailability(slot.id)}
                    className={`rounded-full px-5 py-3 text-left transition-colors ${
                      selectedAvailability === slot.id ? 'bg-[#8B6914] text-white dark:bg-[#D4A847] dark:text-[#1A1008]' : 'glass-subtle'
                    }`}
                  >
                    {formatDateTime(slot.startsAt)}
                  </button>
                ))}
                {selectedStylist && selectedService && availability.length === 0 && (
                  <p className="text-sm text-[var(--text-secondary)]">No open slots found for that combination right now.</p>
                )}
              </div>
            </Glass>
          </div>

          <Glass level="heavy" className="h-fit p-6">
            <h2 className="font-serif text-2xl text-[#1A1008] dark:text-white">Your details</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required placeholder="Full name" className="w-full rounded-full bg-white/30 px-5 py-3 outline-none dark:bg-black/30" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" placeholder="Email address" className="w-full rounded-full bg-white/30 px-5 py-3 outline-none dark:bg-black/30" />
              <input value={phone} onChange={(event) => setPhone(event.target.value)} required placeholder="Phone number" className="w-full rounded-full bg-white/30 px-5 py-3 outline-none dark:bg-black/30" />
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything your stylist should know?" className="min-h-28 w-full rounded-3xl bg-white/30 px-5 py-4 outline-none dark:bg-black/30" />

              <div className="rounded-3xl bg-white/20 p-5 dark:bg-black/20">
                <p className="font-serif text-xl text-[#1A1008] dark:text-white">Summary</p>
                <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                  <p>Stylist: {selectedStylistDetail?.name ?? 'Select a stylist'}</p>
                  <p>Service: {selectedServiceDetail?.name ?? 'Select a service'}</p>
                  <p>Time: {selectedSlot ? formatDateTime(selectedSlot.startsAt) : 'Select a time slot'}</p>
                  <p>Total due in salon: {selectedServiceDetail ? formatCurrency(selectedServiceDetail.price) : '-'}</p>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={saving || !selectedStylist || !selectedService || !selectedAvailability}
                className="w-full rounded-full bg-[#8B6914] py-4 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-[#D4A847] dark:text-[#1A1008]"
              >
                {saving ? 'Saving booking...' : 'Confirm Booking'}
              </button>
            </form>
          </Glass>
        </div>
      )}
    </div>
  );
}
