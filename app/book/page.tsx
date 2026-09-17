"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  LoaderCircle,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { JsonLd } from "@/components/seo/JsonLd";
import type {
  AvailableSlot,
  BookingReservation,
  BookingService,
  MakeupLookType,
  MakeupSkinType,
  StylistSummary,
} from "@/lib/types";

type Step = "service" | "availability" | "details";
const RETAINER_AMOUNT = 35;
const SAME_DAY_FEE = 50;

const LOOK_OPTIONS: MakeupLookType[] = [
  "Soft glam",
  "Full glam",
  "Natural",
  "Not sure",
];
const SKIN_OPTIONS: MakeupSkinType[] = [
  "Oily",
  "Dry",
  "Combination",
  "Normal",
  "Not sure",
];
function dateKey(value: string | Date) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthStart(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function BookingPageContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const canceled = searchParams.get("canceled") === "1";
  const payingInPerson = searchParams.get("payment") === "in_person";
  const reservationId = searchParams.get("reservation");
  const cancelHandledRef = useRef(false);

  const [currentStep, setCurrentStep] = useState<Step>("service");
  const [stylists, setStylists] = useState<StylistSummary[]>([]);
  const [services, setServices] = useState<BookingService[]>([]);
  const [loadingBookingData, setLoadingBookingData] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availability, setAvailability] = useState<AvailableSlot[]>([]);
  const [selectedStylist, setSelectedStylist] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [sameDayAppointment, setSameDayAppointment] = useState(false);
  const paymentMethod: string = "online";
  const [selectedAvailabilityDate, setSelectedAvailabilityDate] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() =>
    monthStart(new Date()),
  );
  const [occasion, setOccasion] = useState("");
  const [referenceDescription, setReferenceDescription] = useState("");
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(
    null,
  );
  const [referenceImageAssetId, setReferenceImageAssetId] = useState<
    string | null
  >(null);
  const [lookType, setLookType] = useState<MakeupLookType>("Soft glam");
  const [skinType, setSkinType] = useState<MakeupSkinType>("Combination");
  const [skinConditionsOrAllergies, setSkinConditionsOrAllergies] =
    useState("");
  const [uploadingReference, setUploadingReference] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRetainerModal, setShowRetainerModal] = useState(false);
  const [reservation, setReservation] = useState<BookingReservation | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoadingBookingData(true);
      try {
        const [servicesResponse, stylistsResponse] = await Promise.all([
          fetch("/api/booking/services"),
          fetch("/api/booking/stylists"),
        ]);
        const servicesJson = await servicesResponse.json();
        const stylistsJson = await stylistsResponse.json();
        if (!servicesResponse.ok)
          throw new Error(servicesJson.error ?? "Unable to load services.");
        if (!stylistsResponse.ok)
          throw new Error(stylistsJson.error ?? "Unable to load artists.");
        setServices(servicesJson.services);
        setStylists(stylistsJson.stylists);
        if (stylistsJson.stylists[0])
          setSelectedStylist(stylistsJson.stylists[0].id);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load booking data.",
        );
      } finally {
        setLoadingBookingData(false);
      }
    }
    void load();
  }, []);

  const filteredServices = services;
  const selectedServiceDetail = useMemo(
    () => services.find((service) => service.id === selectedService) ?? null,
    [services, selectedService],
  );
  const selectedStylistDetail = useMemo(
    () => stylists.find((stylist) => stylist.id === selectedStylist) ?? null,
    [stylists, selectedStylist],
  );
  const selectedSlot = useMemo(
    () => availability.find((slot) => slot.id === selectedAvailability) ?? null,
    [availability, selectedAvailability],
  );
  const isMakeupService = selectedServiceDetail?.serviceType === "makeup";
  const appointmentDateTimeNeeded = selectedSlot
    ? formatDateTime(selectedSlot.startsAt)
    : "";
  const formReady =
    !!fullName &&
    !!phone &&
    !!email &&
    !!selectedAvailability;

  useEffect(() => {
    if (!selectedStylist || !selectedService) return void setAvailability([]);
    async function loadAvailability() {
      setLoadingAvailability(true);
      try {
        const response = await fetch(
          `/api/booking/availability?stylistId=${selectedStylist}&serviceId=${selectedService}`,
        );
        const json = await response.json();
        if (!response.ok)
          throw new Error(json.error ?? "Unable to load availability.");
        setAvailability(json.availability);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load availability.",
        );
      } finally {
        setLoadingAvailability(false);
      }
    }
    void loadAvailability();
  }, [selectedService, selectedStylist]);

  useEffect(() => {
    if (!availability.length) return;
    const firstDate = dateKey(availability[0].startsAt);
    setSelectedAvailabilityDate((current) => current || firstDate);
    setVisibleMonth(monthStart(new Date(availability[0].startsAt)));
  }, [availability]);

  const availabilityByDate = useMemo(() => {
    const grouped = new Map<string, AvailableSlot[]>();
    for (const slot of availability) {
      const key = dateKey(slot.startsAt);
      grouped.set(key, [...(grouped.get(key) ?? []), slot]);
    }
    return grouped;
  }, [availability]);
  const selectedDateSlots =
    availabilityByDate.get(selectedAvailabilityDate) ?? [];
  const bookingTotal =
    (selectedServiceDetail?.price ?? 0) +
    (sameDayAppointment ? SAME_DAY_FEE : 0);
  const bookingFee = RETAINER_AMOUNT + (sameDayAppointment ? SAME_DAY_FEE : 0);

  useEffect(() => {
    async function syncReservationStatus() {
      if (!reservationId) return;
      if (success) {
        setReservation(
          (current) =>
            current ?? {
              id: reservationId,
              availabilityId: "",
              stylistId: "",
              serviceId: "",
              fullName: "",
              email: "",
              phone: "",
              notes: null,
              makeupIntake: null,
              reservationStatus: "confirmed",
              expiresAt: new Date().toISOString(),
            },
        );
        setStatusMessage(
          payingInPerson
            ? "Your appointment is confirmed. Payment is due in person at your appointment."
            : "Your payment completed successfully. We are finalizing your appointment confirmation now.",
        );
        return;
      }
      try {
        const response = await fetch(
          `/api/bookings?reservation=${reservationId}`,
        );
        const json = await response.json();
        if (response.ok && json.data) setReservation(json.data);
      } catch {}
      if (canceled && !cancelHandledRef.current) {
        cancelHandledRef.current = true;
        await fetch("/api/bookings/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reservationId }),
        });
        setStatusMessage(
          "Your appointment hold has been released. You can choose another time whenever you are ready.",
        );
      }
    }
    void syncReservationStatus();
  }, [canceled, payingInPerson, reservationId, success]);

  async function handleReferenceUpload(file: File) {
    setUploadingReference(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/bookings/reference-upload", {
        method: "POST",
        body: formData,
      });
      const json = await response.json();
      if (!response.ok)
        throw new Error(json.error ?? "Unable to upload inspiration photo.");
      setReferenceImageUrl(json.data.url);
      setReferenceImageAssetId(json.data.mediaAsset.id);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload inspiration photo.",
      );
    } finally {
      setUploadingReference(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!formReady) return;
    setShowRetainerModal(true);
  }

  async function confirmRetainerPayment() {
    setShowRetainerModal(false);
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
        sameDayAppointment,
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
                lashesPreference: "Yes",
                hadProfessionalMakeupBefore: "No",
              },
            }
          : {}),
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Unable to continue.");
      window.location.href =
        json.data.checkoutUrl ??
        `/book?success=1&reservation=${json.data.reservationId}&payment=in_person`;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to continue.",
      );
    } finally {
      setSaving(false);
    }
  }

  const steps: Array<{ key: Step; label: string; icon: typeof Sparkles }> = [
    { key: "service", label: "Service", icon: Sparkles },
    { key: "availability", label: "Time", icon: Clock },
    { key: "details", label: "Details", icon: Check },
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
          <h2 className="font-serif text-4xl text-[#4A2109]">
            Deposit Received
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            {statusMessage ??
              "Your deposit has been received. The remaining balance is due at your appointment."}
          </p>
          {reservation?.id && (
            <p className="mt-6 text-sm text-[var(--text-secondary)]">
              Reference hold: {reservation.id}
            </p>
          )}
        </Glass>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {statusMessage && (
        <Glass
          level="medium"
          className="mb-6 p-4 text-sm text-[var(--text-secondary)]"
        >
          {statusMessage}
        </Glass>
      )}
      <div className="mb-8 flex justify-between gap-2 sm:px-10">
        {steps.map((step) => (
          <div key={step.key} className="flex flex-col items-center">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${currentStep === step.key ? "bg-[#8B4411] text-white" : "bg-black/5 text-[var(--text-secondary)]"}`}
            >
              <step.icon size={20} />
            </div>
            <span className="mt-3 hidden text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] sm:block">
              {step.label}
            </span>
          </div>
        ))}
      </div>
      {error && currentStep !== "details" && (
        <p role="alert" className="mb-6 text-center text-sm text-red-600">
          {error}
        </p>
      )}
        {currentStep === "service" && (
          <div className="space-y-6">
            <header className="text-center">
              <h1 className="font-serif text-4xl text-[#4A2109]">
                Choose Your Service
              </h1>
              <p className="mt-4 text-[var(--text-secondary)]">
                Choose your desired glam service, then pick a time and continue
                to secure checkout.
              </p>
            </header>
            {loadingBookingData ? (
              <Glass level="medium" className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
                <LoaderCircle className="animate-spin text-[#8B4411]" size={32} aria-hidden="true" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Loading available services</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Just a moment while we prepare your booking options.</p>
                </div>
              </Glass>
            ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredServices.map((service) => {
                const Icon = Sparkles;
                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service.id);
                      setCurrentStep("availability");
                    }}
                    className={`rounded-3xl border p-6 text-left transition-all hover:scale-[1.02] ${selectedService === service.id ? "border-[#8B4411] bg-[#8B4411]/5" : "border-black/5"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                          Makeup artistry
                        </p>
                        <h3 className="mt-3 font-serif text-2xl text-[var(--text-primary)]">
                          {service.name}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)]">
                          {service.description}
                        </p>
                      </div>
                      <Icon className="shrink-0 text-[#8B4411] opacity-40" />
                    </div>
                    <div className="mt-8 flex items-center justify-end border-t border-black/5 pt-4">
                      <p className="font-serif text-2xl text-[#8B4411]">
                        {formatCurrency(service.price)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            )}
            {!loadingBookingData && !error && filteredServices.length === 0 && (
              <Glass
                level="medium"
                className="p-8 text-center text-[var(--text-secondary)]"
              >
                No makeup services are active yet.
              </Glass>
            )}
          </div>
        )}
        {currentStep === "availability" && (
          <div className="space-y-6">
            <header className="text-center">
              <h1 className="font-serif text-4xl text-[#4A2109]">
                Choose a Time
              </h1>
              <p className="mt-4 text-[var(--text-secondary)]">
                Select a live opening for {selectedServiceDetail?.name}.
              </p>
            </header>
            <div className="mx-auto max-w-2xl">
              {loadingAvailability ? (
                <Glass level="medium" className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
                  <LoaderCircle className="animate-spin text-[#8B4411]" size={32} aria-hidden="true" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Checking live availability</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Finding the best times for your selected service.</p>
                  </div>
                </Glass>
              ) : availability.length > 0 ? (
                <div className="space-y-6">
                  <Glass level="medium" className="p-4 sm:p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <button
                        type="button"
                        aria-label="Previous month"
                        onClick={() =>
                          setVisibleMonth(
                            (month) =>
                              new Date(
                                month.getFullYear(),
                                month.getMonth() - 1,
                                1,
                              ),
                          )
                        }
                        className="rounded-full p-2 transition-colors hover:bg-black/5"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <h2 className="font-serif text-xl text-[var(--text-primary)]">
                        {visibleMonth.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h2>
                      <button
                        type="button"
                        aria-label="Next month"
                        onClick={() =>
                          setVisibleMonth(
                            (month) =>
                              new Date(
                                month.getFullYear(),
                                month.getMonth() + 1,
                                1,
                              ),
                          )
                        }
                        className="rounded-full p-2 transition-colors hover:bg-black/5"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <span key={day} className="py-2">
                            {day}
                          </span>
                        ),
                      )}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from(
                        {
                          length: new Date(
                            visibleMonth.getFullYear(),
                            visibleMonth.getMonth(),
                            1,
                          ).getDay(),
                        },
                        (_, index) => (
                          <span key={`blank-${index}`} />
                        ),
                      )}
                      {Array.from(
                        {
                          length: new Date(
                            visibleMonth.getFullYear(),
                            visibleMonth.getMonth() + 1,
                            0,
                          ).getDate(),
                        },
                        (_, index) => {
                          const day = new Date(
                            visibleMonth.getFullYear(),
                            visibleMonth.getMonth(),
                            index + 1,
                          );
                          const key = dateKey(day);
                          const count =
                            availabilityByDate.get(key)?.length ?? 0;
                          const selected = key === selectedAvailabilityDate;
                          return (
                            <button
                              key={key}
                              type="button"
                              disabled={!count}
                              onClick={() => setSelectedAvailabilityDate(key)}
                              className={`aspect-square rounded-xl text-sm transition-colors ${selected ? "bg-[#8B4411] text-white" : count ? "bg-[#8B4411]/10 font-bold text-[#8B4411] hover:bg-[#8B4411]/20" : "cursor-not-allowed text-[var(--text-secondary)] opacity-30"}`}
                            >
                              <span>{index + 1}</span>
                              {count > 0 && (
                                <span className="mx-auto mt-0.5 block h-1 w-1 rounded-full bg-current" />
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </Glass>
                  <div>
                    <h2 className="font-serif text-xl text-[var(--text-primary)]">
                      {selectedAvailabilityDate
                        ? new Date(
                            `${selectedAvailabilityDate}T12:00:00`,
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })
                        : "Choose a date"}
                    </h2>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {selectedDateSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setSelectedAvailability(slot.id);
                            setCurrentStep("details");
                          }}
                          className="rounded-2xl border border-black/5 bg-white/5 px-4 py-4 text-center font-serif text-lg text-[var(--text-primary)] transition-all hover:border-[#8B4411] hover:bg-[#8B4411]/5"
                        >
                          {new Date(slot.startsAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : !error ? (
                <Glass level="medium" className="p-12 text-center">
                  <Clock
                    size={32}
                    className="mx-auto mb-4 text-[var(--text-secondary)] opacity-30"
                  />
                  <p className="text-[var(--text-secondary)]">
                    No available appointments were found for the next few days.
                  </p>
                </Glass>
              ) : null}
              <button
                onClick={() => setCurrentStep("service")}
                className="mt-6 text-sm text-[var(--text-secondary)] underline underline-offset-4"
              >
                Back to services
              </button>
            </div>
          </div>
        )}
        {currentStep === "details" && (
          <div className="space-y-6">
            <header className="text-center">
              <h1 className="font-serif text-4xl text-[var(--text-primary)]">
                {isMakeupService
                  ? "Complete Your Makeup Booking Form"
                  : "Complete Your Booking"}
              </h1>
              <p className="mt-4 text-[var(--text-secondary)]">
                We will hold your appointment briefly while you complete secure
                payment.
              </p>
            </header>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
              <Glass level="heavy" className="p-8">
                <form
                  id="booking-form"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        Full Name
                      </label>
                      <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        required
                        className="w-full rounded-2xl bg-black/5 px-5 py-3 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        Email Address
                      </label>
                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        type="email"
                        className="w-full rounded-2xl bg-black/5 px-5 py-3 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        Phone Number
                      </label>
                      <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        required
                        className="w-full rounded-2xl bg-black/5 px-5 py-3 outline-none"
                      />
                    </div>
                    {isMakeupService && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                          Appointment Date & Time Needed
                        </label>
                        <input
                          value={appointmentDateTimeNeeded}
                          readOnly
                          className="w-full rounded-2xl bg-black/5 px-5 py-3 text-[var(--text-secondary)] outline-none"
                        />
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-[#8B4411]/20 bg-[#8B4411]/5 px-4 py-3 text-sm text-[var(--text-secondary)]">
                    Need a travel appointment? Text <a href="sms:2247229644" className="font-semibold text-[#8B4411] underline underline-offset-4">224-722-9644</a> for a travel quote before booking.
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#8B4411]/20 bg-[#8B4411]/5 px-4 py-3 text-sm text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={sameDayAppointment}
                      onChange={(event) => setSameDayAppointment(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#8B4411]"
                    />
                    <span>
                      Same-day appointment requested. The <strong>{formatCurrency(SAME_DAY_FEE)}</strong> same-day fee is added to today&apos;s deposit.
                    </span>
                  </label>
                  {isMakeupService ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                          What is the occasion?
                        </label>
                        <input
                          value={occasion}
                          onChange={(event) => setOccasion(event.target.value)}
                          className="w-full rounded-2xl bg-black/5 px-5 py-3 outline-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                          Do you have a reference/inspiration photo? (Please
                          upload or describe your desired look)
                        </label>
                        <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-[#8B4411]/30 bg-[#8B4411]/5 px-5 py-4 text-sm text-[var(--text-secondary)]">
                          <UploadCloud
                            size={18}
                            className="text-[#8B4411]"
                          />
                          {uploadingReference
                            ? "Uploading inspiration photo..."
                            : referenceImageUrl
                              ? "Replace inspiration photo"
                              : "Upload inspiration photo"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) void handleReferenceUpload(file);
                            }}
                          />
                        </label>
                        {referenceImageUrl && (
                          <div className="relative h-40 overflow-hidden rounded-2xl border border-black/5">
                            <Image
                              src={referenceImageUrl}
                              alt="Reference upload preview"
                              fill
                              className="object-cover"
                              sizes="(min-width: 1024px) 30vw, 100vw"
                            />
                          </div>
                        )}
                        <textarea
                          value={referenceDescription}
                          onChange={(event) =>
                            setReferenceDescription(event.target.value)
                          }
                          className="min-h-[120px] w-full rounded-3xl bg-black/5 px-5 py-4 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                            What type of look are you going for?
                          </label>
                          <select
                            value={lookType}
                            onChange={(event) =>
                              setLookType(event.target.value as MakeupLookType)
                            }
                            className="w-full rounded-2xl bg-black/5 px-5 py-3 outline-none"
                          >
                            {LOOK_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                            What is your skin type?
                          </label>
                          <select
                            value={skinType}
                            onChange={(event) =>
                              setSkinType(event.target.value as MakeupSkinType)
                            }
                            className="w-full rounded-2xl bg-black/5 px-5 py-3 outline-none"
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
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                          Do you have any skin conditions or allergies I should
                          be aware of?
                        </label>
                        <textarea
                          value={skinConditionsOrAllergies}
                          onChange={(event) =>
                            setSkinConditionsOrAllergies(event.target.value)
                          }
                          className="min-h-[110px] w-full rounded-3xl bg-black/5 px-5 py-4 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                          Notes for Artist
                        </label>
                        <textarea
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          className="min-h-[120px] w-full rounded-3xl bg-black/5 px-5 py-4 outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        Session Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className="min-h-[120px] w-full rounded-3xl bg-black/5 px-5 py-4 outline-none"
                      />
                    </div>
                  )}
                </form>
              </Glass>
              <div className="space-y-6">
                <Glass level="medium" className="p-6">
                  <h3 className="font-serif text-xl text-[var(--text-primary)]">
                    Review Summary
                  </h3>
                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">
                        Service
                      </span>
                      <span className="font-medium">
                        {selectedServiceDetail?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">
                        Artist
                      </span>
                      <span className="font-medium">
                        {selectedStylistDetail?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">
                        Date & Time
                      </span>
                      <span className="text-right font-medium">
                        {appointmentDateTimeNeeded || "-"}
                      </span>
                    </div>
                    {isMakeupService && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">
                          Occasion
                        </span>
                        <span className="text-right font-medium">
                          {occasion || "-"}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">
                        Service
                      </span>
                      <span className="font-medium">
                        {selectedServiceDetail
                          ? formatCurrency(selectedServiceDetail.price)
                          : "-"}
                      </span>
                    </div>
                    {sameDayAppointment && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Same-day appointment</span>
                        <span className="font-medium">{formatCurrency(SAME_DAY_FEE)}</span>
                      </div>
                    )}
                    <div className="border-t border-black/5 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-[#4A2109]">
                          Full appointment total
                        </span>
                        <span className="text-[#8B4411]">
                          {selectedServiceDetail
                            ? formatCurrency(bookingTotal)
                            : "-"}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#8B4411]/10 px-4 py-3 text-sm text-[var(--text-secondary)]">
                      Deposit due today: <span className="font-bold text-[var(--text-primary)]">{formatCurrency(bookingFee)}</span>
                    </div>
                  </div>
                </Glass>
                <button
                  form="booking-form"
                  type="submit"
                  disabled={saving || uploadingReference || !formReady}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8B4411] py-5 font-bold text-white transition-all hover:shadow-xl hover:shadow-[#8B4411]/20 disabled:opacity-50"
                >
                  {saving
                    ? paymentMethod === "in_person"
                      ? "Confirming appointment..."
                      : "Preparing secure checkout..."
                    : paymentMethod === "in_person"
                      ? "Confirm appointment — pay in person"
                      : `Review ${formatCurrency(bookingFee)} deposit`}
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => setCurrentStep("availability")}
                  className="w-full text-sm text-[var(--text-secondary)]"
                >
                  Change time
                </button>
              </div>
            </div>
            {error && (
              <p className="mt-4 text-center text-sm text-red-500">{error}</p>
            )}
            {showRetainerModal && selectedServiceDetail && (
              <div className="fixed inset-0 z-50 flex items-end bg-black/55 p-4 backdrop-blur-sm sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="retainer-title">
                <Glass level="heavy" className="w-full max-w-md p-6 shadow-2xl sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--text-accent)]">Secure your appointment</p>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B4411]">Appointment deposit</p>
                  <h2 id="retainer-title" className="mt-3 font-serif text-3xl text-[var(--text-primary)]">Pay {formatCurrency(bookingFee)} deposit today</h2>
                  <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">This deposit secures your appointment and is applied to your service total. Remaining balance of <strong className="text-[var(--text-primary)]">{formatCurrency(Math.max(bookingTotal - bookingFee, 0))}</strong> is due at your appointment.</p>
                  <div className="mt-6 rounded-2xl bg-black/5 p-4 text-sm">
                    <div className="flex justify-between gap-4"><span>Service total</span><span className="font-medium">{formatCurrency(bookingTotal)}</span></div>
                    <div className="mt-2 flex justify-between gap-4"><span>Deposit due today</span><span className="font-bold text-[#8B4411]">{formatCurrency(bookingFee)}</span></div>
                  </div>
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setShowRetainerModal(false)} className="rounded-full px-5 py-3 text-sm font-medium text-[var(--text-secondary)]">Back</button>
                    <button type="button" onClick={() => void confirmRetainerPayment()} className="rounded-full bg-[#8B4411] px-6 py-3 font-medium text-white">Pay {formatCurrency(bookingFee)} deposit</button>
                  </div>
                </Glass>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

export default function BookingPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://itzlolabeauty.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Book",
        item: "https://itzlolabeauty.com/book",
      },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            Loading booking experience...
          </div>
        }
      >
        <BookingPageContent />
      </Suspense>
    </>
  );
}
