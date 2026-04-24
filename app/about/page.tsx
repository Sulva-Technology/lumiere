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
            className="rounded-[34px] border border-border-soft bg-surface-primary p-8 shadow-shadow-soft sm:p-10 dark:bg-surface-elevated"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-accent-gold">About Damilola</p>
            <h1 className="mt-5 font-serif text-4xl text-heading-primary sm:text-5xl lg:text-6xl">
              Bringing out beauty through visuals & storytelling.
            </h1>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-text-secondary md:text-xl">
              <p>
                My name is Damilola. I’m a creative based in Arizona. I’ve always been drawn to creating whether it’s through visuals, beauty, or storytelling.
              </p>
              <p>
                I use my creativity to bring out the beauty in people and help them feel confident, seen, and elevated. I’d love to be a part of your story and help bring your vision to life.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-forest-950 px-8 py-4 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-accent-gold dark:text-forest-950">
                Book Your Glam
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-border-soft px-8 py-4 text-sm font-semibold text-heading-primary transition hover:bg-black/5 dark:text-white dark:hover:bg-white/5">
                Start an Inquiry
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.1 }}
            className="overflow-hidden rounded-[34px] border border-border-soft shadow-shadow-soft"
          >
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/founder.jpeg"
                alt="Damilola - Creative & Makeup Artist"
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

