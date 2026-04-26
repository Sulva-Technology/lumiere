'use client';

import { motion } from 'motion/react';
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
      <section className="relative mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative h-[72vh] min-h-[520px] w-full overflow-hidden rounded-[32px] sm:min-h-[600px]">
          <motion.div
            className="absolute inset-0 z-0"
            animate={{ scale: [1.0, 1.05, 1.0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Image
              src="/images/home.jpeg"
              alt="Itz Lola Beauty Studio - Luxury Makeup and Content Creation in Arizona"
              fill
              className="object-cover"
              style={{ objectPosition: 'center 30%' }}
              priority
            />
          </motion.div>

          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#F5F0EA]/90 via-transparent to-transparent dark:from-[#1A1008]/90" />

          <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
            <Glass level="heavy" className="flex w-full max-w-3xl flex-col items-center p-4 text-center sm:p-10 md:p-16">
              <div className="mb-5 flex items-center gap-3 rounded-full border border-[#c8a03c]/20 bg-white/40 px-4 py-2 dark:bg-black/20">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image src="/images/logo.jpeg" alt="itzlolabeauty brand logo" fill className="object-cover" sizes="40px" />
                </div>
                <p className="text-xs uppercase tracking-[0.45em] text-[var(--text-secondary)]">Itz Lola Beauty</p>
              </div>

              <h1 className="mb-5 font-serif text-4xl font-medium tracking-tight sm:mb-6 sm:text-5xl md:text-7xl text-[var(--text-primary)]">
                Luxury Makeup Artist in Arizona
              </h1>

              <p className="mb-8 max-w-2xl text-base text-[var(--text-secondary)] sm:mb-10 sm:text-lg md:text-xl">
                Premium Soft Glam, Full Glam, and Bridal makeup artistry for events, photoshoots, and creators across Arizona. Experience the new standard in beauty and digital storytelling.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/book"
                  className="w-full rounded-full bg-[#8B6914] px-8 py-4 font-medium text-white shadow-lg transition-all hover:scale-[1.02] hover:opacity-90 dark:bg-[#D4A847] dark:text-[#1A1008] sm:w-auto text-center"
                >
                  Book Your Arizona Glam
                </Link>
                <Link
                  href="/contact"
                  className="w-full rounded-full border border-[#8B6914]/30 bg-white/50 px-8 py-4 font-medium text-[#8B6914] transition-all hover:bg-white/80 dark:border-[#D4A847]/30 dark:bg-black/20 dark:text-[#D4A847] sm:w-auto text-center"
                >
                  Submit Bridal Inquiry
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
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)]">Studio Services</h2>
            <p className="text-[var(--text-secondary)]">Tailored beauty and content packages for every occasion in Arizona.</p>
          </div>
          <Link href="/book" className="hidden items-center gap-2 text-sm font-medium text-[var(--text-accent)] transition-opacity hover:opacity-80 sm:flex">
            Explore All Services <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            {
              title: 'Makeup Artistry',
              description: 'From natural Soft Glam to elevated Full Glam and Bridal artistry, we specialize in enhancing your unique features for birthdays, weddings, and photoshoots.',
              cta: 'Book Makeup Artist',
              href: '/book?type=makeup',
              img: 'makeup.jpeg',
            },
            {
              title: 'Content Creation',
              description: 'Professional vertical video, brand photography, and social storytelling sessions designed for creators and brands looking for a polished social presence.',
              cta: 'Reserve Content Session',
              href: '/book?type=content',
              img: 'content.jpeg',
            },
          ].map((cat, index) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
            >
              <Link href={cat.href} className="group block cursor-pointer">
                <Glass level="medium" className="relative flex aspect-[16/9] flex-col justify-end p-8 transition-transform duration-500 group-hover:scale-[1.02]">
                  <Image
                    src={`/images/${cat.img}`}
                    alt={`${cat.title} by Makeup Artist in Arizona`}
                    fill
                    className="object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-80 dark:opacity-40 dark:group-hover:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10">
                    <h3 className="mb-3 font-serif text-3xl text-white">{cat.title}</h3>
                    <p className="mb-4 max-w-sm text-sm leading-relaxed text-white/90">{cat.description}</p>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
                      {cat.cta} <ArrowRight size={14} />
                    </span>
                  </div>
                </Glass>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Booking Process */}
      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <Glass level="medium" className="p-10 md:p-16">
          <div className="mb-12 text-center space-y-4">
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)]">Your Glam Experience</h2>
            <p className="text-[var(--text-secondary)]">A simple 3-step process to secure your session with the top makeup artist in Arizona.</p>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              { step: '01', title: 'Choose Your Service', text: 'Select from our menu of makeup artistry or content creation packages.' },
              { step: '02', title: 'Secure Your Slot', text: 'Pick a live availability time and pay your non-refundable deposit.' },
              { step: '03', title: 'Arrive Ready', text: 'Come to your session prepared to be elevated and feel your most confident.' },
            ].map((item) => (
              <div key={item.step} className="space-y-4 text-center">
                <span className="font-serif text-5xl text-[#8B6914]/20 dark:text-[#D4A847]/20">{item.step}</span>
                <h3 className="font-serif text-xl text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/book" className="inline-flex items-center gap-2 rounded-full bg-[#8B6914] px-8 py-4 font-medium text-white dark:bg-[#D4A847] dark:text-[#1A1008]">
              Start Booking Now <ArrowRight size={18} />
            </Link>
          </div>
        </Glass>
      </section>

      {/* Policies & FAQ */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)]">Booking Policies</h2>
          <div className="space-y-6">
            {[
              { title: 'Deposits', text: 'A non-refundable deposit is required to secure all bookings. This amount is applied toward your total service balance.' },
              { title: 'Travel Policy', text: 'We are based in Arizona. A $20 travel fee applies for mobile services beyond a specific radius (6-8 miles) from our studio location.' },
              { title: 'Late Arrival', text: 'Grace periods are limited. Please arrive on time to ensure you receive the full duration of your premium service.' },
            ].map((policy) => (
              <div key={policy.title} className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-accent)]">{policy.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{policy.text}</p>
              </div>
            ))}
            <Link href="/faq" className="inline-block text-sm font-medium text-[var(--text-accent)] underline underline-offset-4">
              View Full Terms & Conditions
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)]">Common Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'How do I book for a bridal party?', a: 'For bridal parties and group bookings, please use our Contact page to submit a bridal inquiry for custom pricing and availability.' },
              { q: 'Can I reschedule my appointment?', a: 'Rescheduling is permitted with advance notice according to our policy. Your deposit may be transferred to a new date once.' },
              { q: 'Do you offer mobile makeup services?', a: 'Yes, we offer mobile services across Arizona. Travel fees are calculated based on your location during the booking process.' },
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
