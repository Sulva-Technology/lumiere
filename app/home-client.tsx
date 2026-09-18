'use client';

import { Glass } from '@/components/ui/glass';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import type { GalleryItem, StoreSettings } from '@/lib/types';
import { applyStoreSettingsDefaults } from '@/lib/store-settings';

type HomeClientProps = {
  settings: StoreSettings | null;
  gallery: GalleryItem[];
};

const founderIntro = "Hi, I’m Lola, the makeup artist and creative behind itzlolabeauty.";
const founderMission = "For me, makeup has never been just about the finished look. It’s about how you feel while getting ready and the confidence you leave with. My style is all about enhancing you: beautiful skin, soft details, and polished glam that still feels like you.";
const founderClose = "I want the experience to feel just as good as the makeup. Comfortable, intentional, and confident. I can’t wait to have you in my chair! ♡";

export default function Home({ settings, gallery }: HomeClientProps) {
  const resolvedSettings = applyStoreSettingsDefaults(settings);
  const visibility = resolvedSettings.home_section_visibility;

  return (
    <div className="flex flex-col gap-20 pb-24">
      {/* Hero Section */}
      {visibility.hero && (
        <section id="hero" className="relative mx-auto mt-4 w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[4/5] sm:aspect-[16/9] w-full overflow-hidden rounded-[32px] shadow-2xl">
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/home.jpeg"
                alt="Luxury makeup artistry in Arizona by Lola"
                fill
                sizes="(min-width: 1536px) 1536px, 100vw"
                quality={95}
                className="object-cover object-top transition-transform duration-1000 ease-out"
                priority
              />
            </div>

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center">
              <Glass level="heavy" className="flex max-w-2xl flex-col items-center gap-6 p-6 text-center sm:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-md">
                  <Sparkles size={14} className="text-[#E6C687]" /> Luxury Glam Artistry
                </div>
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-tight">
                  Everyday Confidence &amp; Event Glam
                </h1>
                <p className="text-sm sm:text-base text-white/90 max-w-lg leading-relaxed">
                  Tailored soft glam &amp; full glam appointments for photoshoots, birthdays, events, and special occasions.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Link
                    href="/book"
                    className="rounded-full bg-[#8B4411] px-8 py-3.5 text-sm font-semibold text-white shadow-xl transition-all hover:scale-[1.03] hover:bg-[#a14f14]"
                  >
                    Book Your Glam
                  </Link>
                  <a
                    href="#about"
                    className="rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/20"
                  >
                    About Lola
                  </a>
                </div>
              </Glass>
            </div>
          </div>
        </section>
      )}

      {/* About Lola Section */}
      <section id="about" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#c8a03c]/30 bg-white/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-[var(--text-accent)] shadow-sm">
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[#c8a03c]/40">
                <Image src="/images/logo.jpeg" alt="itzlolabeauty logo" fill sizes="32px" quality={95} className="object-cover" />
              </div>
              Meet The Artist
            </div>
            
            <h2 className="font-serif text-4xl sm:text-5xl text-[var(--text-primary)] leading-tight">
              Polished Glam That Still Feels Like You.
            </h2>

            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
              <p>{founderIntro}</p>
              <p>{founderMission}</p>
              <p className="font-medium text-[var(--text-primary)]">{founderClose}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 rounded-2xl bg-white/40 p-3.5 border border-black/5">
                <CheckCircle2 className="text-[#8B4411] shrink-0" size={20} />
                <span className="text-sm font-medium text-[var(--text-primary)]">Personalized Consultation</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/40 p-3.5 border border-black/5">
                <CheckCircle2 className="text-[#8B4411] shrink-0" size={20} />
                <span className="text-sm font-medium text-[var(--text-primary)]">High-End Luxury Products</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-[#8B4411] px-8 py-3.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02] hover:opacity-90">
                Book a Session
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-[var(--text-primary)] px-8 py-3.5 text-sm font-medium text-[var(--text-primary)] transition-opacity hover:opacity-80">
                Get in Touch
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Glass level="heavy" className="overflow-hidden p-2 rounded-[32px] shadow-xl">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px]">
                <Image
                  src="/images/founder.jpeg"
                  alt="Damilola - Founder of Itz Lola Beauty"
                  fill
                  quality={95}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Glass>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section id="services" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--text-accent)]">Services</p>
          <h2 className="font-serif text-4xl md:text-5xl text-[var(--text-primary)]">Signature Services</h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">Choose your look and reserve your appointment date in just a few clicks.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: 'Soft Glam',
              price: '$100',
              duration: '60 Mins',
              desc: 'Natural, glowing skin finish with subtle eyes, soft contour, and a glossy nude lip. Perfect for photoshoots & daytime events.',
              badge: 'Most Popular'
            },
            {
              title: 'Full Glam',
              price: '$120',
              duration: '75 Mins',
              desc: 'Full coverage radiant base, dramatic or cut-crease eyeshadow, custom lashes, and sharp contouring for evening events & galas.',
              badge: 'Showstopper'
            },
            {
              title: 'Bridal / Event Glam',
              price: '$150+',
              duration: '90 Mins',
              desc: 'Tailored bridal & special event makeup crafted for high longevity, camera readiness, and timeless elegance.',
              badge: 'Bridal'
            }
          ].map((svc) => (
            <Glass key={svc.title} level="medium" className="flex flex-col justify-between p-6 sm:p-8 rounded-[28px] border border-white/60 hover:shadow-xl transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#8B4411]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#8B4411]">
                    {svc.badge}
                  </span>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">{svc.duration}</span>
                </div>
                <h3 className="font-serif text-2xl text-[var(--text-primary)]">{svc.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{svc.desc}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-black/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Starting at</p>
                  <p className="font-serif text-2xl font-bold text-[var(--text-primary)]">{svc.price}</p>
                </div>
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 rounded-full bg-[#8B4411] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#a14f14]"
                >
                  Book <ArrowRight size={14} />
                </Link>
              </div>
            </Glass>
          ))}
        </div>
      </section>

      {/* Portfolio Gallery Section */}
      {visibility.gallery && gallery.length > 0 && (
        <section id="portfolio" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-28">
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
                  quality={95}
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

      {/* Booking Policies Section */}
      {visibility.policies && (
        <section id="policies" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-28">
          <div className="space-y-8 rounded-[32px] bg-white/40 p-8 sm:p-12 border border-black/5 backdrop-blur-md">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--text-accent)]">Policies</p>
              <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)]">Booking &amp; Appointment Policies</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Payments', text: 'All payments must be made in cash or Zelle. A non-refundable $35 deposit secures your slot and counts toward your total balance.' },
                { title: 'Rescheduling', text: 'Reschedule by texting 224-722-9644 at least 24 hours in advance. Your deposit will be transferred to your new appointment.' },
                { title: 'Travel & Location', text: 'Travel quotes depend on location. Text 224-722-9644 with your event location for a custom quote.' },
              ].map((policy) => (
                <div key={policy.title} className="space-y-2 rounded-2xl bg-white/60 p-6 border border-black/5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B4411]">{policy.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{policy.text}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 flex justify-between items-center flex-wrap gap-4">
              <Link href="/terms-of-service" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-accent)] underline underline-offset-4 hover:opacity-80">
                View Full Terms &amp; Conditions
              </Link>
              <Link href="/book" className="rounded-full bg-[#8B4411] px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-[#a14f14]">
                Book Appointment Now
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

