'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function AboutPage() {
  return (
    <main className="px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-16">
        <section className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="rounded-[34px] border border-[rgba(58,77,57,0.12)] bg-[linear-gradient(135deg,rgba(248,241,233,0.98),rgba(241,236,229,0.94))] p-7 shadow-[0_28px_90px_rgba(52,42,30,0.08)] dark:border-[rgba(154,177,143,0.14)] dark:bg-[linear-gradient(135deg,rgba(21,30,24,0.96),rgba(11,18,15,0.98))]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8B6914] dark:text-[#F0D080]">About Itz Lola Beauty</p>
            <h1 className="mt-4 font-serif text-4xl text-[var(--heading-primary)] sm:text-5xl dark:text-white">
              Warm, polished artistry built around how you want to feel in the moment.
            </h1>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-[var(--text-secondary)]">
              <p>
                Itz Lola Beauty was shaped for clients who want more than a pretty final look. The goal is a calm, elevated experience where your features are understood, your timing is respected, and your glam feels intentional from every angle.
              </p>
              <p>
                Whether the appointment is for a wedding morning, a birthday dinner, a photoshoot, or a confidence reset, the work is rooted in reliability, thoughtful prep, and makeup that wears beautifully in person and on camera.
              </p>
              <p>
                Every booking is approached with care so you can arrive feeling seen, supported, and fully ready for the moment ahead.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-[#8B6914] px-8 py-4 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-[#D4A847] dark:text-[#1A1008]">
                Book your glam
              </Link>
              <Link href="/contact?service=Bridal%20Wedding%20Day%20Makeup" className="inline-flex items-center justify-center rounded-full border border-[rgba(58,77,57,0.18)] px-8 py-4 text-sm font-semibold text-[var(--heading-primary)] transition hover:bg-black/5 dark:border-[rgba(154,177,143,0.18)] dark:text-white dark:hover:bg-white/5">
                Start an inquiry
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.1 }}
            className="overflow-hidden rounded-[34px] border border-[rgba(58,77,57,0.12)] shadow-[0_28px_90px_rgba(43,49,38,0.10)] dark:border-[rgba(154,177,143,0.14)]"
          >
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/founder.jpeg"
                alt="Portrait of the Itz Lola Beauty founder."
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
