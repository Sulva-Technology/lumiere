'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Glass } from '@/components/ui/glass';

const founderIntro = "My name is Damilola. I'm a creative based in Arizona. I've always been drawn to creating whether it's through visuals, beauty, or storytelling.";
const founderMission = "I use my creativity to bring out the beauty in people and help them feel confident, seen, and elevated.";
const founderClose = "I'd love to be a part of your story and help bring your vision to life.";

export default function AboutClient() {
  return (
    <main className="min-h-screen px-6 pb-24 pt-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-20">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#c8a03c]/20 bg-white/50 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)] dark:bg-black/20">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image src="/images/logo.jpeg" alt="itzlolabeauty logo" fill className="object-cover" sizes="40px" />
              </div>
              Itz Lola Beauty
            </div>
            <div className="space-y-4">
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">{founderIntro}</p>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">{founderMission}</p>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">{founderClose}</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-[#8B6914] px-8 py-4 font-medium text-white transition-opacity hover:opacity-90 dark:bg-[#D4A847] dark:text-[#102014]">
                Book a Session
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-[var(--text-primary)] px-8 py-4 font-medium text-[var(--text-primary)] transition-opacity hover:opacity-80">
                Get in Touch
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.15 }}>
            <Glass level="heavy" className="overflow-hidden p-0">
              <div className="relative aspect-[4/5]">
                <Image src="/images/founder.jpeg" alt="Damilola - Founder of Itz Lola Beauty" fill className="object-cover" priority sizes="(min-width: 1024px) 40vw, 100vw" />
              </div>
            </Glass>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
