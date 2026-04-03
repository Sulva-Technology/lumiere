'use client';

import { useEffect, useMemo, useState } from 'react';
import { Glass } from '@/components/ui/glass';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, ChevronLeft, Calendar, Clock, Sparkles, User, Camera } from 'lucide-react';
import Image from 'next/image';
import type { AvailableSlot, BookingConfirmation, BookingService, StylistSummary } from '@/lib/types';

type Step = 'service' | 'artist' | 'availability' | 'details';

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('service');
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
        const [servicesResponse, stylistsResponse] = await Promise.all([
          fetch('/api/booking/services'),
          fetch('/api/booking/stylists')
        ]);
        const servicesJson = await servicesResponse.json();
        const stylistsJson = await stylistsResponse.json();
        if (!servicesResponse.ok) throw new Error(servicesJson.error ?? 'Unable to load services.');
        if (!stylistsResponse.ok) throw new Error(stylistsJson.error ?? 'Unable to load stylists.');
        setServices(servicesJson.services);
        setStylists(stylistsJson.stylists);
        
        // Auto-select the first artist if not already selected
        if (stylistsJson.stylists.length > 0 && !selectedStylist) {
          setSelectedStylist(stylistsJson.stylists[0].id);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load booking data.');
      }
    }
    void load();
  }, [selectedStylist]);

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

  const selectedServiceDetail = useMemo(() => services.find((s) => s.id === selectedService) ?? null, [services, selectedService]);
  const selectedStylistDetail = useMemo(() => stylists.find((s) => s.id === selectedStylist) ?? null, [stylists, selectedStylist]);
  const selectedSlot = useMemo(() => availability.find((s) => s.id === selectedAvailability) ?? null, [availability, selectedAvailability]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stylistId: selectedStylist,
          serviceId: selectedService,
          availabilityId: selectedAvailability,
          fullName, email, phone, notes,
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

  const steps: { key: Step; label: string; icon: any }[] = [
    { key: 'service', label: 'Service', icon: Sparkles },
    { key: 'artist', label: 'Artist', icon: User },
    { key: 'availability', label: 'Time', icon: Clock },
    { key: 'details', label: 'Details', icon: Check },
  ];

  if (confirmation) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <Glass level="heavy" className="p-10 text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500 mb-6">
              <Check size={40} />
            </div>
            <h2 className="font-serif text-4xl text-[#1A1008] dark:text-white">Booking Confirmed</h2>
            <p className="mt-4 text-xl text-[var(--text-secondary)]">Reference: <span className="font-mono font-bold text-[#8B6914] dark:text-[#F0D080]">{confirmation.bookingReference}</span></p>
            <div className="mt-10 w-full rounded-2xl bg-black/5 p-6 text-left dark:bg-white/5">
              <p className="text-sm uppercase tracking-widest text-[var(--text-secondary)]">Experience Details</p>
              <div className="mt-4 space-y-3">
                <p className="text-lg"><strong>Service:</strong> {confirmation.serviceName}</p>
                <p className="text-lg"><strong>Artist:</strong> {confirmation.stylistName}</p>
                <p className="text-lg"><strong>When:</strong> {formatDateTime(confirmation.startsAt)}</p>
              </div>
            </div>
            <p className="mt-8 text-[var(--text-secondary)]">A confirmation email has been sent to {email}.</p>
          </motion.div>
        </Glass>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Step Indicator */}
      <div className="mb-12 flex justify-between px-4 sm:px-10">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.key;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > idx;
          
          return (
            <div key={step.key} className="relative flex flex-col items-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 ${
                isActive ? 'bg-[#8B6914] text-white ring-4 ring-[#8B6914]/20 scale-110 dark:bg-[#D4A847] dark:text-[#1A1008]' : 
                isCompleted ? 'bg-green-500/20 text-green-500' : 'bg-black/5 text-[var(--text-secondary)] dark:bg-white/5'
              }`}>
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <span className={`mt-3 hidden text-[10px] font-bold uppercase tracking-[0.2em] sm:block ${isActive ? 'text-[#8B6914] dark:text-[#D4A847]' : 'text-[var(--text-secondary)] opacity-50'}`}>
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`absolute left-16 top-6 hidden h-[2px] w-12 sm:block md:w-20 lg:w-28 ${isCompleted ? 'bg-green-500/20' : 'bg-black/5 dark:bg-white/5'}`} />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'service' && (
          <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <header className="text-center">
              <h1 className="font-serif text-4xl text-[#1A1008] dark:text-white">Choose Your Experience</h1>
              <p className="mt-4 text-[var(--text-secondary)]">Select from our signature makeup and content services.</p>
            </header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service.id); setCurrentStep('artist'); }}
                  className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition-all hover:scale-[1.02] ${
                    selectedService === service.id ? 'border-[#8B6914] bg-[#8B6914]/5 dark:border-[#D4A847]' : 'border-black/5 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-2xl text-[#1A1008] dark:text-white">{service.name}</h3>
                      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{service.description}</p>
                    </div>
                    {service.slug.includes('content') ? <Camera className="text-[#8B6914] dark:text-[#D4A847] opacity-40" /> : <Sparkles className="text-[#8B6914] dark:text-[#D4A847] opacity-40" />}
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/5">
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{service.durationMinutes} minutes</p>
                    <p className="font-serif text-2xl text-[#8B6914] dark:text-[#F0D080]">{formatCurrency(service.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {currentStep === 'artist' && (
          <motion.div key="artist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <header className="text-center">
              <h1 className="font-serif text-4xl text-[#1A1008] dark:text-white">Meet Your Creative</h1>
              <p className="mt-4 text-[var(--text-secondary)]">Experience artistry tailored to your unique vision.</p>
            </header>
            
            <div className="mx-auto max-w-2xl">
              {stylists.map((stylist) => (
                <Glass key={stylist.id} level="heavy" className="overflow-hidden p-0">
                  <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
                    <div className="relative aspect-square md:aspect-auto">
                      <Image 
                        src="/images/content_studio.png" 
                        alt={stylist.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="p-8">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#8B6914]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8B6914] dark:bg-[#D4A847]/10 dark:text-[#D4A847]">Lead Artist</span>
                        <div className="flex gap-0.5 text-yellow-500"><Sparkles size={12} fill="currentColor" /></div>
                      </div>
                      <h3 className="font-serif text-3xl text-[#1A1008] dark:text-white">{stylist.name}</h3>
                      <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{stylist.bio}</p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {stylist.specialties.map(spec => (
                          <span key={spec} className="rounded-full border border-black/5 bg-black/5 px-3 py-1 text-xs text-[var(--text-secondary)] dark:border-white/5 dark:bg-white/5">{spec}</span>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentStep('availability')}
                        className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#1A1008] py-4 font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#1A1008]"
                      >
                        Confirm Artist
                        <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </Glass>
              ))}
              <button onClick={() => setCurrentStep('service')} className="mt-6 text-sm text-[var(--text-secondary)] underline underline-offset-4">Back to services</button>
            </div>
          </motion.div>
        )}

        {currentStep === 'availability' && (
          <motion.div key="availability" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <header className="text-center">
              <h1 className="font-serif text-4xl text-[#1A1008] dark:text-white">Choose a Time</h1>
              <p className="mt-4 text-[var(--text-secondary)]">Your session for {selectedServiceDetail?.name}.</p>
            </header>

            <div className="mx-auto max-w-2xl">
              {availability.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {availability.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => { setSelectedAvailability(slot.id); setCurrentStep('details'); }}
                      className={`flex flex-col rounded-2xl border p-5 text-left transition-all hover:scale-[1.02] ${
                        selectedAvailability === slot.id ? 'border-[#8B6914] bg-[#8B6914]/5 dark:border-[#D4A847]' : 'border-black/5 dark:border-white/5 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Calendar size={14} />
                        <span className="text-xs uppercase tracking-widest">{new Date(slot.startsAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-serif text-2xl text-[#1A1008] dark:text-white">{new Date(slot.startsAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        <ChevronRight size={18} className="text-[#8B6914] dark:text-[#D4A847]" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <Glass level="medium" className="p-12 text-center">
                  <Clock size={32} className="mx-auto text-[var(--text-secondary)] opacity-30 mb-4" />
                  <p className="text-[var(--text-secondary)]">No available slots found for the next few days.</p>
                  <button onClick={() => setCurrentStep('service')} className="mt-6 font-medium text-[#8B6914] dark:text-[#F0D080]">Choose another service</button>
                </Glass>
              )}
              <button onClick={() => setCurrentStep('artist')} className="mt-6 text-sm text-[var(--text-secondary)] underline underline-offset-4">Back to artist</button>
            </div>
          </motion.div>
        )}

        {currentStep === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <header className="text-center">
              <h1 className="font-serif text-4xl text-[#1A1008] dark:text-white">Finalize Your Booking</h1>
              <p className="mt-4 text-[var(--text-secondary)]">Secure your session at theDMAshop.</p>
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
              <Glass level="heavy" className="p-8">
                <form id="booking-form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Full Name</label>
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Jane Doe" className="w-full rounded-2xl bg-black/5 px-5 py-3 outline-none dark:bg-white/5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Email Address</label>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="jane@example.com" className="w-full rounded-2xl bg-black/5 px-5 py-3 outline-none dark:bg-white/5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Phone Number</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+1 (555) 000-0000" className="w-full rounded-2xl bg-black/5 px-5 py-3 outline-none dark:bg-white/5" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Notes for Artist</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific requirements or vision for the session?" className="min-h-[120px] w-full rounded-3xl bg-black/5 px-5 py-4 outline-none dark:bg-white/5" />
                  </div>
                </form>
              </Glass>

              <div className="space-y-6">
                <Glass level="medium" className="p-6">
                  <h3 className="font-serif text-xl text-[#1A1008] dark:text-white">Review Summary</h3>
                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Service</span>
                      <span className="font-medium">{selectedServiceDetail?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Artist</span>
                      <span className="font-medium">{selectedStylistDetail?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Date & Time</span>
                      <span className="font-medium text-right">{selectedSlot ? formatDateTime(selectedSlot.startsAt) : '-'}</span>
                    </div>
                    <div className="border-t border-black/5 pt-4 dark:border-white/5">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-[#1A1008] dark:text-white">Total</span>
                        <span className="text-[#8B6914] dark:text-[#F0D080]">{selectedServiceDetail ? formatCurrency(selectedServiceDetail.price) : '-'}</span>
                      </div>
                    </div>
                  </div>
                </Glass>

                <button
                  form="booking-form"
                  type="submit"
                  disabled={saving || !fullName || !email || !phone}
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#8B6914] py-5 font-bold text-white transition-all hover:shadow-xl hover:shadow-[#8B6914]/20 disabled:opacity-50 dark:bg-[#D4A847] dark:text-[#1A1008]"
                >
                  {saving ? 'Processing...' : 'Confirm Booking'}
                  <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                </button>
                <button onClick={() => setCurrentStep('availability')} className="w-full text-sm text-[var(--text-secondary)]">Change time</button>
              </div>
            </div>
            {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
