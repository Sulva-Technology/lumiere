'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarHeart,
  Camera,
  Clock3,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';

import { ContactInquiryForm } from '@/components/contact-inquiry-form';
import { FaqAccordion } from '@/components/faq-accordion';
import {
  bookingSteps,
  faqItems,
  policyPreviewItems,
  portfolioCategories,
  trustReasons,
} from '@/lib/marketing-content';
import { formatCurrency } from '@/lib/format';
import { applyStoreSettingsDefaults } from '@/lib/store-settings';
import type { BookingService, StoreSettings } from '@/lib/types';

type HomeClientProps = {
  settings: StoreSettings | null;
  services: BookingService[];
};

function findServiceBySlug(services: BookingService[], slugs: string[]) {
  return services.find((service) => slugs.includes(service.slug));
}

function formatDurationLabel(durationMinutes: number | null | undefined, fallback: string) {
  return durationMinutes ? `${durationMinutes} min` : fallback;
}

function createBookingHref(serviceType: 'makeup' | 'content', serviceSlug?: string) {
  const params = new URLSearchParams({ type: serviceType });
  if (serviceSlug) {
    params.set('service', serviceSlug);
  }
  return `/book?${params.toString()}`;
}

export default function Home({ settings, services }: HomeClientProps) {
  const resolvedSettings = applyStoreSettingsDefaults(settings);
  const softGlam = findServiceBySlug(services, ['soft-glam']);
  const fullGlam = findServiceBySlug(services, ['full-glam']);
  const contentServices = services.filter((service) => service.serviceType === 'content');

  const contentStartingPrice = contentServices.length > 0 ? Math.min(...contentServices.map((service) => service.price)) : null;
  const contentDurations = contentServices.map((service) => service.durationMinutes).sort((a, b) => a - b);
  const contentDurationLabel =
    contentDurations.length > 1
      ? `${contentDurations[0]}-${contentDurations[contentDurations.length - 1]} min`
      : contentDurations.length === 1
        ? `${contentDurations[0]} min`
        : '30-120 min';

  const featuredServices = [
    {
      name: 'Soft Glam',
      description: 'A radiant, polished finish that still feels like you. Ideal when you want elevated beauty without going full dramatic.',
      startingPrice: softGlam ? formatCurrency(softGlam.price) : '$120',
      duration: formatDurationLabel(softGlam?.durationMinutes, '90 min'),
      bestFor: 'Engagement shoots, date nights, brunches, portraits, and confidence-boosting everyday glam.',
      ctaLabel: 'Book soft glam',
      href: createBookingHref('makeup', softGlam?.slug),
    },
    {
      name: 'Full Glam',
      description: 'Defined eyes, fuller coverage, and a camera-ready finish built for high-impact beauty moments.',
      startingPrice: fullGlam ? formatCurrency(fullGlam.price) : '$170',
      duration: formatDurationLabel(fullGlam?.durationMinutes, '120 min'),
      bestFor: 'Birthdays, luxury dinners, photoshoots, celebrations, and statement event makeup.',
      ctaLabel: 'Book full glam',
      href: createBookingHref('makeup', fullGlam?.slug),
    },
    {
      name: 'Birthday / Event Glam',
      description: 'Special-occasion glam shaped around your outfit, lighting, venue, and the energy of the event.',
      startingPrice: fullGlam ? formatCurrency(fullGlam.price) : '$170',
      duration: formatDurationLabel(fullGlam?.durationMinutes, '120 min'),
      bestFor: 'Birthday dinners, graduations, galas, baby showers, and event nights where photos matter.',
      ctaLabel: 'Book event glam',
      href: createBookingHref('makeup', fullGlam?.slug),
    },
    // {
    //   name: 'Bridal Preview',
    //   description: 'A trial session to refine your wedding-day look, skin finish, lash choice, and overall beauty direction.',
    //   startingPrice: 'Custom quote',
    //   duration: '90-120 min',
    //   bestFor: 'Brides who want clarity, confidence, and a polished beauty plan before the big day.',
    //   ctaLabel: 'Inquire for bridal',
    //   href: '/contact?service=Bridal%20Preview',
    // },
    // {
    //   name: 'Bridal Wedding Day Makeup',
    //   description: 'Luxury bridal glam designed to photograph beautifully, wear comfortably, and hold from first look to final dance.',
    //   startingPrice: 'Custom quote',
    //   duration: 'By timeline',
    //   bestFor: 'Wedding mornings, ceremonies, receptions, and brides who want an organized, calming beauty experience.',
    //   ctaLabel: 'Start bridal inquiry',
    //   href: '/contact?service=Bridal%20Wedding%20Day%20Makeup',
    // },
    // {
    //   name: 'Bridal Party Makeup',
    //   description: 'Cohesive, elevated glam for bridesmaids, family, and key members of your wedding-day beauty schedule.',
    //   startingPrice: 'Custom quote',
    //   duration: '45-60 min / person',
    //   bestFor: 'Wedding parties that want consistency, timeliness, and a polished group beauty plan.',
    //   ctaLabel: 'Inquire for your party',
    //   href: '/contact?service=Bridal%20Party%20Makeup',
    // },
    {
      name: 'Content Creation Package',
      description: 'Beauty support for creators, campaigns, and polished visual storytelling with a camera-conscious finish.',
      startingPrice: contentStartingPrice ? formatCurrency(contentStartingPrice) : '$70',
      duration: contentDurationLabel,
      bestFor: 'Brand shoots, creator sessions, campaign days, product content, and elevated social media visuals.',
      ctaLabel: 'Book content support',
      href: createBookingHref('content'),
    },
  ];

  const heroTags = ['Bridal Glam', 'Event Makeup', 'Content-Ready Looks'];
  const testimonials = resolvedSettings.homepage_testimonials;
  const supportDetails = [
    `Booking contact: ${resolvedSettings.booking_contact_email || resolvedSettings.support_email || 'hello@itzlolabeauty.com'}`,
    `Support: ${resolvedSettings.support_phone || 'By confirmation message'}`,
  ];

  return (
    <div className="flex flex-col">
      <section className="relative -mt-24 min-h-[100svh] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
        >
          <Image
            src="/images/home.jpeg"
            alt="Luxury beauty portrait showcasing polished makeup artistry."
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(18,12,7,0.88)_0%,rgba(18,12,7,0.62)_42%,rgba(52,34,24,0.32)_65%,rgba(255,247,242,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,71,0.18),transparent_32%)]" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl items-end px-4 pb-14 pt-36 sm:px-6 sm:pb-18 lg:px-8 lg:pb-20">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-xs font-semibold uppercase tracking-[0.42em] text-[#f3d7a2]"
            >
              Itz Lola Beauty
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.08 }}
              className="mt-5 max-w-4xl font-serif text-5xl leading-[0.92] text-white sm:text-6xl lg:text-7xl"
            >
              Luxury Glam for Photoshoots, Events, Bridal &amp; Everyday Confidence.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.18 }}
              className="mt-6 max-w-2xl text-base leading-7 text-white/82 sm:text-lg"
            >
              Makeup artistry for women who want to feel polished, photographed beautifully, and fully taken care of from booking to final blend.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-full bg-[#8B6914] px-7 py-4 text-sm font-semibold text-white shadow-[0_22px_60px_rgba(139,105,20,0.28)] transition hover:translate-y-[-1px] hover:opacity-95 dark:bg-[#D4A847] dark:text-[#1A1008]"
              >
                Book Your Glam
              </Link>
              <Link
                href="/#services"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/14"
              >
                View Services
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              {heroTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/88 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-32 mx-auto w-full max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8B6914] dark:text-[#F0D080]">Featured Services</p>
          <h2 className="mt-4 font-serif text-4xl text-[var(--heading-primary)] sm:text-5xl dark:text-white">
            Compare services quickly, then book with confidence.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--text-secondary)]">
            Clear offers, starting prices, estimated timing, and the right next step for bridal, event, lesson, and content inquiries.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredServices.map((service, index) => (
            <motion.article
              key={service.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: index * 0.04 }}
              className="flex h-full flex-col justify-between rounded-[28px] border border-[rgba(58,77,57,0.12)] bg-white/78 p-6 shadow-[0_22px_80px_rgba(43,49,38,0.06)] backdrop-blur-sm dark:border-[rgba(154,177,143,0.14)] dark:bg-[rgba(12,21,16,0.74)]"
            >
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(139,105,20,0.10)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8B6914] dark:bg-[rgba(212,168,71,0.12)] dark:text-[#F0D080]">
                  <Sparkles size={14} />
                  Service
                </div>
                <h3 className="mt-5 font-serif text-3xl text-[var(--heading-primary)] dark:text-white">{service.name}</h3>
                <p className="mt-3 leading-7 text-[var(--text-secondary)]">{service.description}</p>
              </div>

              <div className="mt-8 space-y-4 border-t border-[rgba(58,77,57,0.10)] pt-5 dark:border-[rgba(154,177,143,0.12)]">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-[var(--text-secondary)]">Starting at</span>
                  <span className="font-semibold text-[var(--heading-primary)] dark:text-white">{service.startingPrice}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-[var(--text-secondary)]">Duration</span>
                  <span className="font-semibold text-[var(--heading-primary)] dark:text-white">{service.duration}</span>
                </div>
                <div className="rounded-[20px] bg-[rgba(58,77,57,0.04)] p-4 dark:bg-[rgba(255,255,255,0.04)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">Best for</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-primary)] dark:text-white/88">{service.bestFor}</p>
                </div>
                <Link
                  href={service.href}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#17301f] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-[#D4A847] dark:text-[#1A1008]"
                >
                  {service.ctaLabel}
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="portfolio" className="scroll-mt-32 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8B6914] dark:text-[#F0D080]">Portfolio Preview</p>
            <h2 className="mt-4 font-serif text-4xl text-[var(--heading-primary)] sm:text-5xl dark:text-white">
              Beauty that holds up in person, on camera, and across the whole event.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--text-secondary)]">
              From soft glam to creator-ready content days, each look is shaped for the lighting, setting, and story around it.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {portfolioCategories.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-[30px]"
              >
                <div className="relative min-h-[300px]">
                  <Image
                    src={item.imageSrc}
                    alt={item.alt}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,12,8,0.08),rgba(16,12,8,0.72))]" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Category</p>
                    <h3 className="mt-3 font-serif text-3xl text-white">{item.title}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-white/82">{item.description}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8B6914] dark:text-[#F0D080]">Why Book With Itz Lola Beauty</p>
          <h2 className="mt-4 font-serif text-4xl text-[var(--heading-primary)] sm:text-5xl dark:text-white">
            A warm experience with polished execution from inquiry to final look.
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {trustReasons.map((reason, index) => {
            const icons = [HeartHandshake, ShieldCheck, Star] as const;
            const Icon = icons[index] ?? Sparkles;

            return (
              <motion.article
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.05 }}
                className="rounded-[28px] border border-[rgba(58,77,57,0.12)] bg-white/76 p-7 shadow-[0_22px_80px_rgba(43,49,38,0.05)] dark:border-[rgba(154,177,143,0.14)] dark:bg-[rgba(12,21,16,0.72)]"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(139,105,20,0.10)] text-[#8B6914] dark:bg-[rgba(212,168,71,0.12)] dark:text-[#F0D080]">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 font-serif text-3xl text-[var(--heading-primary)] dark:text-white">{reason.title}</h3>
                <p className="mt-4 leading-7 text-[var(--text-secondary)]">{reason.description}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-[rgba(58,77,57,0.12)] bg-[linear-gradient(145deg,rgba(250,246,241,0.96),rgba(241,234,225,0.92))] px-6 py-10 shadow-[0_28px_90px_rgba(52,42,30,0.08)] sm:px-8 lg:px-10 lg:py-12 dark:border-[rgba(154,177,143,0.14)] dark:bg-[linear-gradient(145deg,rgba(21,30,24,0.96),rgba(11,18,15,0.98))]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8B6914] dark:text-[#F0D080]">Booking Process</p>
            <h2 className="mt-4 font-serif text-4xl text-[var(--heading-primary)] sm:text-5xl dark:text-white">
              A simple three-step path from interest to appointment confirmation.
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {bookingSteps.map((step, index) => (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                className="rounded-[28px] bg-white/72 p-6 dark:bg-[rgba(255,255,255,0.04)]"
              >
                <p className="text-5xl font-serif text-[#8B6914] dark:text-[#F0D080]">0{index + 1}</p>
                <h3 className="mt-4 font-serif text-3xl text-[var(--heading-primary)] dark:text-white">{step.title}</h3>
                <p className="mt-3 leading-7 text-[var(--text-secondary)]">{step.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
        <div className="overflow-hidden rounded-[34px] border border-[rgba(139,105,20,0.18)] bg-[linear-gradient(120deg,rgba(31,18,12,0.96),rgba(90,54,33,0.92))] px-6 py-10 shadow-[0_30px_100px_rgba(44,23,10,0.28)] sm:px-8 lg:px-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#f0d080]">Bridal &amp; Event Beauty</p>
              <h2 className="mt-4 font-serif text-4xl text-white sm:text-5xl">Need wedding-day beauty, group glam, or a custom event timeline?</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/78">
                Bridal mornings, destination timelines, and event bookings deserve more than a generic checkout flow. Reach out and we&apos;ll shape the right plan around your date, location, and party size.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start">
              <Link
                href="/contact?service=Bridal%20Wedding%20Day%20Makeup"
                className="inline-flex items-center justify-center rounded-full bg-[#f0d080] px-6 py-4 text-sm font-semibold text-[#24150c] transition hover:opacity-95"
              >
                Start bridal inquiry
              </Link>
              <Link
                href="/book?type=makeup"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/16 bg-white/8 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Book makeup online
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8B6914] dark:text-[#F0D080]">Testimonials</p>
          <h2 className="mt-4 font-serif text-4xl text-[var(--heading-primary)] sm:text-5xl dark:text-white">
            Clients come for the glam, and remember how cared for they felt.
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.blockquote
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.05 }}
              className="rounded-[28px] border border-[rgba(58,77,57,0.12)] bg-white/78 p-7 shadow-[0_20px_70px_rgba(43,49,38,0.05)] dark:border-[rgba(154,177,143,0.14)] dark:bg-[rgba(12,21,16,0.72)]"
            >
              <div className="flex items-center gap-2 text-[#8B6914] dark:text-[#F0D080]">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="mt-5 text-lg leading-8 text-[var(--heading-primary)] dark:text-white/90">&ldquo;{testimonial.quote}&rdquo;</p>
              <footer className="mt-6">
                <p className="font-semibold text-[var(--heading-primary)] dark:text-white">{testimonial.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{testimonial.context}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>

      <section id="policies" className="scroll-mt-32 mx-auto w-full max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8B6914] dark:text-[#F0D080]">Policies Preview</p>
            <h2 className="mt-4 font-serif text-4xl text-[var(--heading-primary)] sm:text-5xl dark:text-white">
              Clear, respectful policies that protect your date without feeling harsh.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--text-secondary)]">
              The essentials are easy to scan here, with the full policy page available for planning bridal or custom bookings in more detail.
            </p>
            <Link
              href="/policies"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-[rgba(58,77,57,0.18)] px-6 py-3 text-sm font-semibold text-[var(--heading-primary)] transition hover:bg-black/5 dark:border-[rgba(154,177,143,0.18)] dark:text-white dark:hover:bg-white/5"
            >
              Read full policies
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {policyPreviewItems.map((policy, index) => (
              <motion.article
                key={policy.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.04 }}
                className="rounded-[26px] border border-[rgba(58,77,57,0.12)] bg-white/78 p-6 shadow-[0_20px_70px_rgba(43,49,38,0.05)] dark:border-[rgba(154,177,143,0.14)] dark:bg-[rgba(12,21,16,0.72)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8B6914] dark:text-[#F0D080]">{policy.title}</p>
                <p className="mt-3 leading-7 text-[var(--text-secondary)]">{policy.summary}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-32 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8B6914] dark:text-[#F0D080]">FAQ</p>
          <h2 className="mt-4 font-serif text-4xl text-[var(--heading-primary)] sm:text-5xl dark:text-white">
            The questions most clients ask before they reserve their date.
          </h2>
        </motion.div>

        <FaqAccordion items={faqItems} className="mt-10" />
      </section>

      <section id="contact" className="scroll-mt-32 mx-auto w-full max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="rounded-[32px] border border-[rgba(58,77,57,0.12)] bg-[linear-gradient(135deg,rgba(248,241,233,0.98),rgba(241,236,229,0.94))] p-7 shadow-[0_25px_90px_rgba(52,42,30,0.08)] dark:border-[rgba(154,177,143,0.14)] dark:bg-[linear-gradient(135deg,rgba(21,30,24,0.96),rgba(11,18,15,0.98))]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8B6914] dark:text-[#F0D080]">Contact / Inquiry</p>
            <h2 className="mt-4 font-serif text-4xl text-[var(--heading-primary)] dark:text-white">Tell us about your date, your look, and what kind of support you need.</h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--text-secondary)]">
              Bridal, event, content creation, and custom beauty requests can all start here. If you already know your service and want to move quickly, online booking is still available.
            </p>

            <div className="mt-8 space-y-4">
              {supportDetails.map((detail) => (
                <div key={detail} className="flex items-start gap-3 rounded-[22px] bg-white/70 px-4 py-4 dark:bg-[rgba(255,255,255,0.04)]">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(139,105,20,0.10)] text-[#8B6914] dark:bg-[rgba(212,168,71,0.12)] dark:text-[#F0D080]">
                    {detail.includes('Support') ? <Clock3 size={18} /> : <CalendarHeart size={18} />}
                  </div>
                  <p className="text-sm leading-6 text-[var(--text-primary)] dark:text-white/88">{detail}</p>
                </div>
              ))}

              <div className="flex items-start gap-3 rounded-[22px] bg-white/70 px-4 py-4 dark:bg-[rgba(255,255,255,0.04)]">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(139,105,20,0.10)] text-[#8B6914] dark:bg-[rgba(212,168,71,0.12)] dark:text-[#F0D080]">
                  <Camera size={18} />
                </div>
                <p className="text-sm leading-6 text-[var(--text-primary)] dark:text-white/88">
                  Creator sessions, event glam, and bridal beauty all receive a tailored response based on date, location, and timing needs.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-full bg-[#17301f] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-[#D4A847] dark:text-[#1A1008]"
              >
                Book now
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(58,77,57,0.18)] px-6 py-3 text-sm font-semibold text-[var(--heading-primary)] transition hover:bg-black/5 dark:border-[rgba(154,177,143,0.18)] dark:text-white dark:hover:bg-white/5"
              >
                Meet the artist
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="rounded-[32px] border border-[rgba(58,77,57,0.12)] bg-white/82 p-7 shadow-[0_25px_90px_rgba(43,49,38,0.06)] dark:border-[rgba(154,177,143,0.14)] dark:bg-[rgba(12,21,16,0.78)]"
          >
            <ContactInquiryForm />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
