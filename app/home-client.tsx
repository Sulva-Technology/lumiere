'use client';

import { Glass } from '@/components/ui/glass';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { StoreSettings } from '@/lib/types';
import { applyStoreSettingsDefaults } from '@/lib/store-settings';

type HomeClientProps = {
  settings: StoreSettings | null;
};

export default function Home({ settings }: HomeClientProps) {
  const resolvedSettings = applyStoreSettingsDefaults(settings);

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative mx-auto mt-4 w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[4/5] sm:aspect-[16/9] w-full overflow-hidden rounded-[32px]">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/home.jpeg"
              alt="Itz Lola Beauty Studio - Luxury Makeup in Arizona"
              fill
              className="object-cover object-top"
              priority
            />
          </div>

          <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-black/30" />

          <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
            <Glass level="heavy" className="flex w-fit flex-col items-center p-4 text-center sm:p-6">
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/book"
                  className="rounded-full bg-[#8B6914] px-10 py-4 font-medium text-white shadow-lg transition-all hover:scale-[1.02] hover:opacity-90 dark:bg-[#D4A847] dark:text-[#1A1008] text-center"
                >
                  Book Now
                </Link>
              </div>
            </Glass>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)]">Services</h2>
          </div>
          <Link href="/book" className="hidden items-center gap-2 text-sm font-medium text-[var(--text-accent)] transition-opacity hover:opacity-80 sm:flex">
            Explore All Services <ArrowRight size={16} />
          </Link>
        </div>

        <div>
          {[
            {
              title: 'Makeup Artistry',
              description: 'From natural Soft Glam to elevated Full Glam, we specialize in enhancing your unique features for birthdays, events, and photoshoots.',
              cta: 'Book Makeup Artist',
              href: '/book?type=makeup',
              img: 'makeup.jpeg',
            },
          ].map((cat, index) => (
            <div
              key={cat.title}
            >
              <Link href={cat.href} className="group block cursor-pointer">
                <Glass level="medium" className="relative flex min-h-[380px] flex-col justify-end overflow-hidden p-8 sm:min-h-[440px] sm:p-12 transition-transform duration-500 group-hover:scale-[1.01]">
                  <Image
                    src={`/images/${cat.img}`}
                    alt={`${cat.title} by Makeup Artist in Arizona`}
                    fill
                    className="object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-80 dark:opacity-40 dark:group-hover:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-white/70">Luxury makeup appointments</p>
                    <h3 className="mb-3 font-serif text-4xl text-white sm:text-5xl">{cat.title}</h3>
                    <p className="mb-5 max-w-xl text-base leading-relaxed text-white/90">{cat.description}</p>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
                      {cat.cta} <ArrowRight size={14} />
                    </span>
                  </div>
                </Glass>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Policies & FAQ */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)]">Booking Policies</h2>
          <div className="space-y-6">
            {[
              { title: 'Booking & Retainer', text: 'A non-refundable $35 retainer is required to secure your appointment date.' },
              { title: 'Late Arrival', text: 'A 10-minute grace period is allowed. After that, a $20 late fee applies; appointments more than 15 minutes late are cancelled.' },
              { title: 'No-Show Policy', text: 'A missed appointment without notice results in loss of the retainer and a charge for the service.' },
              { title: 'Photos & Social Media', text: 'The artist may photograph completed looks for portfolio and promotional use unless you let us know otherwise.' },
            ].map((policy) => (
              <div key={policy.title} className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-accent)]">{policy.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{policy.text}</p>
              </div>
            ))}
            <Link href="/terms-of-service" className="inline-block text-sm font-medium text-[var(--text-accent)] underline underline-offset-4">
              View Full Terms & Conditions
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)]">Common Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'Do you accommodate group bookings?', a: 'Yes! For group bookings and special events, please use our Contact page to submit an inquiry for custom pricing and availability.' },
              { q: 'Can I reschedule my appointment?', a: 'Please contact us at least 24 hours before your appointment. Your retainer can be transferred to one new appointment date with proper notice.' },
              { q: 'Do you offer mobile makeup services?', a: 'Yes. Select the travel-fee option during booking and we will confirm the fee for your location.' },
            ].map((faq) => (
              <div key={faq.q} className="space-y-2">
                <h3 className="font-serif text-lg text-[var(--text-primary)]">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
