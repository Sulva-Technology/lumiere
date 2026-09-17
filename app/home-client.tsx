'use client';

import { Glass } from '@/components/ui/glass';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { GalleryItem, StoreSettings } from '@/lib/types';
import { applyStoreSettingsDefaults } from '@/lib/store-settings';

type HomeClientProps = {
  settings: StoreSettings | null;
  gallery: GalleryItem[];
};

export default function Home({ settings, gallery }: HomeClientProps) {
  const resolvedSettings = applyStoreSettingsDefaults(settings);
  const visibility = resolvedSettings.home_section_visibility;

  return (
    <div className="flex flex-col gap-24 pb-24">
      {visibility.hero && (
      <section className="relative mx-auto mt-4 w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[4/5] sm:aspect-[16/9] w-full overflow-hidden rounded-[32px]">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/home.jpeg"
              alt="Luxury makeup artistry in Arizona by Lola"
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
                  className="rounded-full bg-[#8B4411] px-10 py-4 font-medium text-white shadow-lg transition-all hover:scale-[1.02] hover:opacity-90 text-center"
                >
                  Book Now
                </Link>
              </div>
            </Glass>
          </div>
        </div>
      </section>
      )}

      {visibility.gallery && gallery.length > 0 && (
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--text-accent)]">The portfolio</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[var(--text-primary)]">Glam, tailored to you.</h2>
          </div>
          <Link href="/book" className="hidden items-center gap-2 text-sm font-medium text-[var(--text-accent)] transition-opacity hover:opacity-80 sm:flex">
            Book your look <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-12">
          {gallery.slice(0, 5).map((item, index) => (
            <figure
              key={item.id}
              className={`group relative overflow-hidden rounded-[24px] bg-white ${index === 0 ? 'col-span-2 row-span-2 aspect-[4/5] lg:col-span-7' : 'aspect-[4/5] lg:col-span-5'} ${index > 2 ? 'lg:col-span-4' : ''}`}
            >
              <Image
                src={item.imageUrl}
                alt={item.alt}
                fill
                sizes={index === 0 ? '(min-width: 1024px) 56vw, 100vw' : '(min-width: 1024px) 33vw, 50vw'}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                {item.category && <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">{item.category}</p>}
                {item.title && <p className="mt-1 font-serif text-2xl sm:text-3xl">{item.title}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-8 sm:hidden">
          <Link href="/book" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-accent)]">
            Book your look <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      )}

      {visibility.policies && (
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {visibility.policies && <div className="space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)]">Booking Policies</h2>
          <div className="space-y-6">
            {[
              { title: 'Payments', text: 'All payments must be made in cash or Zelle. No exceptions. A non-refundable $35 booking fee is required to secure your appointment. This booking fee is applied toward your total service cost.' },
              { title: 'Rescheduling', text: 'Need to reschedule? Please text 224-722-9644 at least 24 hours before your scheduled appointment. Your deposit will be transferred to your new appointment if you provide at least 24 hours notice.' },
              { title: 'Travel Policy', text: 'Travel fees are determined based on the service location. To receive a travel quote, please text 224-722-9644 with the address where you would like your makeup service to be provided.' },
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
        </div>}

      </section>
      )}
    </div>
  );
}
