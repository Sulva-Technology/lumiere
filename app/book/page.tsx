'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, Camera, Check, ChevronRight, Clock, Sparkles, UploadCloud } from 'lucide-react';
import { Glass } from '@/components/ui/glass';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type {
  AvailableSlot,
  BookingReservation,
  BookingService,
  BookingServiceType,
  MakeupHistoryAnswer,
  MakeupLashesPreference,
  MakeupLookType,
  MakeupSkinType,
  StylistSummary,
} from '@/lib/types';

type Step = 'service' | 'availability' | 'details';

const LOOK_OPTIONS: MakeupLookType[] = ['Soft glam', 'Full glam', 'Natural', 'Not sure'];
const SKIN_OPTIONS: MakeupSkinType[] = ['Oily', 'Dry', 'Combination', 'Normal', 'Not sure'];
const LASH_OPTIONS: MakeupLashesPreference[] = ['Yes', 'No', "I'll bring my own"];
const HISTORY_OPTIONS: MakeupHistoryAnswer[] = ['Yes', 'No'];
const TYPE_OPTIONS: Array<{ value: BookingServiceType; label: string; icon: typeof Sparkles }> = [
  { value: 'makeup', label: 'Makeup', icon: Sparkles },
  { value: 'content', label: 'Content', icon: Camera },
];

function BookingPageContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === '1';
  const canceled = searchParams.get('canceled') === '1';
  const reservationId = searchParams.get('reservation');
  const requestedType = searchParams.get('type') === 'content' ? 'content' : 'makeup';
  const requestedServiceSlug = searchParams.get('service')?.trim().toLowerCase() ?? '';
  const cancelHandledRef = useRef(false);
  const requestedServiceHandledRef = useRef(false);

  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [serviceType, setServiceType] = useState<BookingServiceType>(requestedType);
  const [stylists, setStylists] = useState<StylistSummary[]>([]);
  const [services, setServices] = useState<BookingService[]>([]);
  const [availability, setAvailability] = useState<AvailableSlot[]>([]);
  const [selectedStylist, setSelectedStylist] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [occasion, setOccasion] = useState('');
  const [referenceDescription, setReferenceDescription] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [referenceImageAssetId, setReferenceImageAssetId] = useState<string | null>(null);
  const [lookType, setLookType] = useState<MakeupLookType>('Soft glam');
  const [skinType, setSkinType] = useState<MakeupSkinType>('Combination');
  const [skinConditionsOrAllergies, setSkinConditionsOrAllergies] = useState('');
  const [lashesPreference, setLashesPreference] = useState<MakeupLashesPreference>('Yes');
  const [hadProfessionalMakeupBefore, setHadProfessionalMakeupBefore] = useState<MakeupHistoryAnswer>('No');
  const [priorExperienceNotes, setPriorExperienceNotes] = useState('');
  const [productPreferencesOrRestrictions, setProductPreferencesOrRestrictions] = useState('');
  const [uploadingReference, setUploadingReference] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reservation, setReservation] = useState<BookingReservation | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [servicesResponse, stylistsResponse] = await Promise.all([fetch('/api/booking/services'), fetch('/api/booking/stylists')]);
        const servicesJson = await servicesResponse.json();
        const stylistsJson = await stylistsResponse.json();
        if (!servicesResponse.ok) throw new Error(servicesJson.error ?? 'Unable to load services.');
        if (!stylistsResponse.ok) throw new Error(stylistsJson.error ?? 'Unable to load artists.');
        setServices(servicesJson.services);
        setStylists(stylistsJson.stylists);
        if (stylistsJson.stylists[0] && !selectedStylist) setSelectedStylist(stylistsJson.stylists[0].id);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load booking data.');
      }
    }
    void load();
  }, [selectedStylist]);

  useEffect(() => {
    setServiceType(requestedType);
  }, [requestedType]);

  useEffect(() => {
    requestedServiceHandledRef.current = false;
  }, [requestedServiceSlug, requestedType]);

  const filteredServices = useMemo(() => services.filter((service) => service.serviceType === serviceType), [serviceType, services]);
  const selectedServiceDetail = useMemo(() => services.find((service) => service.id === selectedService) ?? null, [services, selectedService]);
  const selectedStylistDetail = useMemo(() => stylists.find((stylist) => stylist.id === selectedStylist) ?? null, [stylists, selectedStylist]);
  const selectedSlot = useMemo(() => availability.find((slot) => slot.id === selectedAvailability) ?? null, [availability, selectedAvailability]);
  const isMakeupService = selectedServiceDetail?.serviceType === 'makeup';
  const appointmentDateTimeNeeded = selectedSlot ? formatDateTime(selectedSlot.startsAt) : '';
  const formReady =
    !!fullName &&
    !!phone &&
    !!email &&
    !!selectedAvailability &&
    (!isMakeupService || (!!occasion && !!referenceDescription && !!appointmentDateTimeNeeded && !!skinConditionsOrAllergies));

  useEffect(() => {
    if (selectedServiceDetail && selectedServiceDetail.serviceType !== serviceType) setSelectedService('');
    setSelectedAvailability('');
  }, [serviceType, selectedServiceDetail]);

  useEffect(() => {
    if (!selectedStylist || !selectedService) return void setAvailability([]);
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

  useEffect(() => {
    if (!requestedServiceSlug || requestedServiceHandledRef.current || services.length === 0) return;

    const requestedService =
      services.find((service) => service.slug.toLowerCase() === requestedServiceSlug && service.serviceType === requestedType) ??
      services.find((service) => service.slug.toLowerCase() === requestedServiceSlug);

    if (!requestedService) return;

    requestedServiceHandledRef.current = true;
    setServiceType(requestedService.serviceType);
    setSelectedService(requestedService.id);
    setSelectedAvailability('');
    setCurrentStep('availability');
  }, [requestedServiceSlug, requestedType, services]);

  useEffect(() => {
    async function syncReservationStatus() {
      if (!reservationId) return;
      if (success) {
        setReservation((current) => current ?? { id: reservationId, availabilityId: '', stylistId: '', serviceId: '', fullName: '', email: '', phone: '', notes: null, makeupIntake: null, reservationStatus: 'confirmed', expiresAt: new Date().toISOString() });
        setStatusMessage('Your payment completed successfully. We are finalizing your appointment confirmation now.');
        return;
      }
      try {
        const response = await fetch(`/api/bookings?reservation=${reservationId}`);
        const json = await response.json();
        if (response.ok && json.data) setReservation(json.data);
      } catch {}
      if (canceled && !cancelHandledRef.current) {
        cancelHandledRef.current = true;
        await fetch('/api/bookings/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reservationId }) });
        setStatusMessage('Your appointment hold has been released. You can choose another time whenever you are ready.');
      }
    }
    void syncReservationStatus();
  }, [canceled, reservationId, success]);

  async function handleReferenceUpload(file: File) {
    setUploadingReference(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/bookings/reference-upload', { method: 'POST', body: formData });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to upload inspiration photo.');
      setReferenceImageUrl(json.data.url);
      setReferenceImageAssetId(json.data.mediaAsset.id);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload inspiration photo.');
    } finally {
      setUploadingReference(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        stylistId: selectedStylist,
        serviceId: selectedService,
        availabilityId: selectedAvailability,
        fullName,
        email,
        phone,
        notes,
        ...(isMakeupService
          ? {
              makeupIntake: {
                appointmentDateTimeNeeded,
                occasion,
                referenceDescription,
                referenceImageUrl,
                referenceImageAssetId,
                lookType,
                skinType,
                skinConditionsOrAllergies,
                lashesPreference,
                hadProfessionalMakeupBefore,
                priorExperienceNotes: priorExperienceNotes || null,
                productPreferencesOrRestrictions: productPreferencesOrRestrictions || null,
              },
            }
          : {}),
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to continue.');
      window.location.href = json.data.checkoutUrl;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to continue.');
    } finally {
      setSaving(false);
    }
  }

  const steps: Array<{ key: Step; label: string; icon: typeof Sparkles }> = [
    { key: 'service', label: 'Service', icon: Sparkles },
    { key: 'availability', label: 'Time', icon: Clock },
    { key: 'details', label: 'Details', icon: Check },
  ];

  if (success) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <Glass level="heavy" className="p-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500">
              <Check size={40} />
            </div>
          </div>
          <h2 className="font-serif text-4xl text-heading-primary">Payment Received</h2>
          <p className="mt-4 text-lg text-text-secondary">
            {statusMessage ?? 'Your appointment is being finalized. Confirmation details will follow shortly.'}
          </p>
          {reservation?.id && <p className="mt-6 text-sm text-text-secondary">Reference hold: {reservation.id}</p>}
        </Glass>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {statusMessage && <Glass level="medium" className="mb-6 p-4 text-sm text-text-secondary">{statusMessage}</Glass>}
      <div className="mb-8 flex justify-between gap-2 sm:px-10">
        {steps.map((step) => (
          <div key={step.key} className="flex flex-col items-center">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                currentStep === step.key
                  ? 'bg-forest-950 text-white dark:bg-accent-gold dark:text-forest-950'
                  : 'bg-black/5 text-text-secondary dark:bg-white/5'
              }`}
            >
              <step.icon size={20} />
            </div>
            <span className="mt-3 hidden text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary sm:block">
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {currentStep === 'service' && (
          <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <header className="text-center">
              <h1 className="font-serif text-4xl text-heading-primary">Choose Your Service</h1>
              <p className="mt-4 text-text-secondary">
                Start by choosing between makeup services and content services, then pick your time and continue to secure checkout.
              </p>
            </header>
            <div className="mx-auto flex max-w-md rounded-full bg-black/5 p-1 dark:bg-white/5">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setServiceType(option.value);
                    setSelectedService('');
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition ${
                    serviceType === option.value
                      ? 'bg-forest-950 text-white dark:bg-accent-gold dark:text-forest-950'
                      : 'text-text-secondary'
                  }`}
                >
                  <option.icon size={16} />
                  {option.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredServices.map((service) => {
                const Icon = service.serviceType === 'content' ? Camera : Sparkles;
                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service.id);
                      setCurrentStep('availability');
                    }}
                    className={`rounded-3xl border p-6 text-left transition-all hover:scale-[1.02] ${
                      selectedService === service.id
                        ? 'border-accent-gold bg-accent-gold/5 dark:border-accent-gold'
                        : 'border-black/5 dark:border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-text-secondary">{service.serviceType}</p>
                        <h3 className="mt-3 font-serif text-2xl text-heading-primary">{service.name}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{service.description}</p>
                      </div>
                      <Icon className="shrink-0 text-accent-gold opacity-40" />
                    </div>
                    <div className="mt-8 flex items-center justify-between border-t border-border-soft pt-4">
                      <p className="text-sm font-medium text-text-secondary">{service.durationMinutes} minutes</p>
                      <p className="font-serif text-2xl text-accent-gold">{formatCurrency(service.price)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredServices.length === 0 && (
              <Glass level="medium" className="p-8 text-center text-text-secondary">
                No {serviceType} services are active yet.
              </Glass>
            )}
          </motion.div>
        )}
        {currentStep === 'availability' && (
          <motion.div key="availability" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <header className="text-center">
              <h1 className="font-serif text-4xl text-heading-primary">Choose a Time</h1>
              <p className="mt-4 text-text-secondary">Select a live opening for {selectedServiceDetail?.name}.</p>
            </header>
            <div className="mx-auto max-w-2xl">
              {availability.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {availability.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        setSelectedAvailability(slot.id);
                        setCurrentStep('details');
                      }}
                      className={`flex flex-col rounded-2xl border p-5 text-left transition-all hover:scale-[1.02] ${
                        selectedAvailability === slot.id
                          ? 'border-accent-gold bg-accent-gold/5 dark:border-accent-gold'
                          : 'border-border-soft bg-white/5 dark:border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Calendar size={14} />
                        <span className="text-xs uppercase tracking-widest">
                          {new Date(slot.startsAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-serif text-2xl text-heading-primary">
                          {new Date(slot.startsAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <ChevronRight size={18} className="text-accent-gold" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <Glass level="medium" className="p-12 text-center">
                  <Clock size={32} className="mx-auto mb-4 text-text-secondary opacity-30" />
                  <p className="text-text-secondary">No available appointments were found for the next few days.</p>
                </Glass>
              )}
              <button onClick={() => setCurrentStep('service')} className="mt-6 text-sm text-text-secondary underline underline-offset-4">
                Back to services
              </button>
            </div>
          </motion.div>
        )}
        {currentStep === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <header className="text-center">
              <h1 className="font-serif text-4xl text-heading-primary">
                {isMakeupService ? 'Complete Your Makeup Intake' : 'Complete Your Booking'}
              </h1>
              <p className="mt-4 text-text-secondary">We will hold your appointment briefly while you complete secure payment.</p>
            </header>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
              <Glass level="heavy" className="p-8">
                <form id="booking-form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Full Name</label>
                      <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        required
                        className="w-full rounded-2xl bg-black/5 px-5 py-3 text-text-primary outline-none dark:bg-white/5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Email Address</label>
                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        type="email"
                        className="w-full rounded-2xl bg-black/5 px-5 py-3 text-text-primary outline-none dark:bg-white/5"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Phone Number</label>
                      <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        required
                        className="w-full rounded-2xl bg-black/5 px-5 py-3 text-text-primary outline-none dark:bg-white/5"
                      />
                    </div>
                    {isMakeupService && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Appointment Date & Time Needed</label>
                        <input
                          value={appointmentDateTimeNeeded}
                          readOnly
                          className="w-full rounded-2xl bg-black/5 px-5 py-3 text-text-secondary outline-none dark:bg-white/5"
                        />
                      </div>
                    )}
                  </div>
                  {isMakeupService ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">What is the occasion?</label>
                        <input
                          value={occasion}
                          onChange={(event) => setOccasion(event.target.value)}
                          required
                          className="w-full rounded-2xl bg-black/5 px-5 py-3 text-text-primary outline-none dark:bg-white/5"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                          Do you have a reference/inspiration photo?
                        </label>
                        <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-accent-gold/30 bg-accent-gold/5 px-5 py-4 text-sm text-text-secondary">
                          <UploadCloud size={18} className="text-accent-gold" />
                          {uploadingReference ? 'Uploading...' : referenceImageUrl ? 'Replace photo' : 'Upload photo'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) void handleReferenceUpload(file);
                            }}
                          />
                        </label>
                        {referenceImageUrl && (
                          <div className="relative h-40 overflow-hidden rounded-2xl border border-border-soft">
                            <Image src={referenceImageUrl} alt="Reference preview" fill className="object-cover" />
                          </div>
                        )}
                        <textarea
                          placeholder="Describe your desired look or add specific notes about colors/styles..."
                          value={referenceDescription}
                          onChange={(event) => setReferenceDescription(event.target.value)}
                          required
                          className="min-h-[120px] w-full rounded-3xl bg-black/5 px-5 py-4 text-text-primary outline-none dark:bg-white/5"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Look Type</label>
                          <select
                            value={lookType}
                            onChange={(event) => setLookType(event.target.value as MakeupLookType)}
                            className="w-full rounded-2xl bg-black/5 px-5 py-3 text-text-primary outline-none dark:bg-white/5"
                          >
                            {LOOK_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Skin Type</label>
                          <select
                            value={skinType}
                            onChange={(event) => setSkinType(event.target.value as MakeupSkinType)}
                            className="w-full rounded-2xl bg-black/5 px-5 py-3 text-text-primary outline-none dark:bg-white/5"
                          >
                            {SKIN_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                          Skin conditions or allergies?
                        </label>
                        <textarea
                          value={skinConditionsOrAllergies}
                          onChange={(event) => setSkinConditionsOrAllergies(event.target.value)}
                          required
                          className="min-h-[100px] w-full rounded-3xl bg-black/5 px-5 py-4 text-text-primary outline-none dark:bg-white/5"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Session Notes</label>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className="min-h-[120px] w-full rounded-3xl bg-black/5 px-5 py-4 text-text-primary outline-none dark:bg-white/5"
                      />
                    </div>
                  )}
                </form>
              </Glass>

              <div className="space-y-6">
                <Glass level="medium" className="p-6">
                  <h3 className="font-serif text-xl text-heading-primary">Review Summary</h3>
                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Service</span>
                      <span className="font-semibold text-heading-primary">{selectedServiceDetail?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Date & Time</span>
                      <span className="text-right font-semibold text-heading-primary">{appointmentDateTimeNeeded || '-'}</span>
                    </div>
                    <div className="border-t border-border-soft pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-heading-primary">Total</span>
                        <span className="text-accent-gold">{selectedServiceDetail ? formatCurrency(selectedServiceDetail.price) : '-'}</span>
                      </div>
                    </div>
                  </div>
                </Glass>
                <button
                  form="booking-form"
                  type="submit"
                  disabled={saving || uploadingReference || !formReady}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-forest-950 py-5 font-bold text-white shadow-xl transition-all hover:opacity-95 disabled:opacity-50 dark:bg-accent-gold dark:text-forest-950"
                >
                  {saving ? 'Preparing checkout...' : 'Continue to secure checkout'}
                  <ChevronRight size={20} />
                </button>
                <button onClick={() => setCurrentStep('availability')} className="w-full text-sm text-text-secondary">
                  Change time
                </button>
              </div>
            </div>
            {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BookingPage() {
  return <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">Loading booking experience...</div>}><BookingPageContent /></Suspense>;
}
