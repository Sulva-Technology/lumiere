import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarHeart, Camera, Clock3, MapPin } from 'lucide-react';

import { ContactInquiryForm } from '@/components/contact-inquiry-form';
import { getPublicStoreSettings } from '@/lib/data/public';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Send a bridal, event, content creation, or general beauty inquiry to Itz Lola Beauty and get the right next step for your date.',
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ service?: string }>;
}) {
  const store = await getPublicStoreSettings();
  const params = searchParams ? await searchParams : undefined;
  const requestedService = params?.service;
  const detailCards = [
    {
      title: 'Booking contact',
      value: store.bookingContactEmail || store.supportEmail,
      icon: CalendarHeart,
    },
    {
      title: 'Support',
      value: store.supportPhone || 'Shared during confirmation',
      icon: Clock3,
    },
    {
      title: 'Location requests',
      value: 'Share your city, venue, or on-location request in the form so travel details can be reviewed early.',
      icon: MapPin,
    },
    {
      title: 'Best for',
      value: 'Bridal inquiries, event glam, creator sessions, lessons, and custom beauty requests.',
      icon: Camera,
    },
  ];

  return (
    <main className="px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-[34px] border border-[rgba(58,77,57,0.12)] bg-[linear-gradient(135deg,rgba(248,241,233,0.98),rgba(241,236,229,0.94))] p-7 shadow-[0_28px_90px_rgba(52,42,30,0.08)] dark:border-[rgba(154,177,143,0.14)] dark:bg-[linear-gradient(135deg,rgba(21,30,24,0.96),rgba(11,18,15,0.98))]">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8B6914] dark:text-[#F0D080]">Contact</p>
            <h1 className="mt-4 font-serif text-4xl text-[var(--heading-primary)] sm:text-5xl dark:text-white">
              Let&apos;s plan the right beauty experience for your date.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
              Use the inquiry form for bridal bookings, group events, creator sessions, makeup lessons, or anything that needs a more tailored plan than a standard online booking.
            </p>

            <div className="mt-8 grid gap-4">
              {detailCards.map((card) => (
                <article key={card.title} className="rounded-[24px] bg-white/72 p-5 dark:bg-[rgba(255,255,255,0.04)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(139,105,20,0.10)] text-[#8B6914] dark:bg-[rgba(212,168,71,0.12)] dark:text-[#F0D080]">
                      <card.icon size={19} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">{card.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-primary)] dark:text-white/88">{card.value}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-[#17301f] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-[#D4A847] dark:text-[#1A1008]">
                Book online
              </Link>
              <Link href="/policies" className="inline-flex items-center justify-center rounded-full border border-[rgba(58,77,57,0.18)] px-6 py-3 text-sm font-semibold text-[var(--heading-primary)] transition hover:bg-black/5 dark:border-[rgba(154,177,143,0.18)] dark:text-white dark:hover:bg-white/5">
                Review policies
              </Link>
            </div>
          </div>

          <section className="rounded-[34px] border border-[rgba(58,77,57,0.12)] bg-white/84 p-7 shadow-[0_24px_80px_rgba(43,49,38,0.06)] dark:border-[rgba(154,177,143,0.14)] dark:bg-[rgba(12,21,16,0.78)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8B6914] dark:text-[#F0D080]">Inquiry Form</p>
            <h2 className="mt-4 font-serif text-3xl text-[var(--heading-primary)] dark:text-white">Share your event details, preferred service, and location.</h2>
            <p className="mt-4 text-[var(--text-secondary)]">
              The more detail you include, the easier it is to recommend the right service, timing, and next step.
            </p>
            <ContactInquiryForm className="mt-8" defaultServiceInterest={requestedService} />
          </section>
        </section>
      </div>
    </main>
  );
}
