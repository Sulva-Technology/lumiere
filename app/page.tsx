'use client';

import { motion } from 'motion/react';
import { Glass } from '@/components/ui/glass';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const headlineWords = 'Own Your Look.'.split(' ');

export default function Home() {
  return (
    <div className="flex flex-col gap-24">
      <section className="relative mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative h-[72vh] min-h-[520px] w-full overflow-hidden rounded-[32px] sm:min-h-[600px]">
          <motion.div
            className="absolute inset-0 z-0"
            animate={{ scale: [1.0, 1.08, 1.0] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          >
            <Image
              src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1920&h=1080"
              alt="Beauty editorial model"
              fill
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#F5F0EA]/90 via-transparent to-transparent dark:from-[#1A1008]/90" />

          <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
            <Glass level="heavy" className="flex w-full max-w-3xl flex-col items-center p-6 text-center sm:p-10 md:p-16">
              <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[var(--text-secondary)]">Hair + Makeup</p>
              <h1 className="mb-5 flex flex-wrap justify-center gap-x-4 font-serif text-4xl font-medium tracking-tight sm:mb-6 sm:text-5xl md:text-7xl">
                {headlineWords.map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.12 + 0.2, duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="mb-8 max-w-2xl text-base text-[var(--text-secondary)] sm:mb-10 sm:text-lg md:text-xl"
              >
                Shop a polished beauty edit of premium hair, complexion essentials, and artist-loved finishing touches.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="flex items-center justify-center"
              >
                <Link
                  href="/shop"
                  className="w-full rounded-full bg-[#8B6914] px-8 py-4 font-medium text-white shadow-lg transition-opacity hover:opacity-90 dark:bg-[#D4A847] dark:text-[#1A1008] sm:w-auto"
                >
                  Shop the Beauty Edit
                </Link>
              </motion.div>
            </Glass>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-10 flex items-end justify-between"
        >
          <h2 className="font-serif text-3xl md:text-4xl">Curated Collections</h2>
          <Link href="/shop" className="hidden items-center gap-2 text-sm font-medium text-[var(--text-accent)] transition-opacity hover:opacity-80 sm:flex">
            View All <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: 'Hair Extensions',
              description: 'Luxury bundles, wigs, and install-ready texture.',
              href: '/shop?category=wigs-extensions',
              img: '1519699047748-de8e457a634e',
            },
            {
              title: 'Makeup Essentials',
              description: 'Complexion, color, and glow staples for every look.',
              href: '/shop?category=makeup-essentials',
              img: '1487412720507-e7ab37603c6f',
            },
            {
              title: 'Beauty Tools',
              description: 'Brushes, finishers, and pro-level accessories.',
              href: '/shop?category=beauty-tools',
              img: '1522337660859-02fbefca4702',
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
                <Glass level="medium" className="relative flex aspect-[4/5] flex-col justify-end p-6 transition-transform duration-500 group-hover:scale-[1.02]">
                  <Image
                    src={`https://images.unsplash.com/photo-${cat.img}?auto=format&fit=crop&q=80&w=600&h=800`}
                    alt={cat.title}
                    fill
                    className="object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-80 dark:opacity-40 dark:group-hover:opacity-60"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="relative z-10">
                    <h3 className="mb-2 font-serif text-2xl text-white">{cat.title}</h3>
                    <p className="max-w-xs text-sm text-white/85">{cat.description}</p>
                    <div className="mt-4 h-px w-0 bg-white transition-all duration-500 ease-out group-hover:w-full" />
                  </div>
                </Glass>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Glass level="heavy" className="p-8 text-center md:p-12">
          <h2 className="font-serif text-3xl md:text-5xl">Beauty, styled with intention.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            From premium hair textures to makeup must-haves, every product is selected to help customers build polished looks with confidence.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--text-primary)] px-6 py-3 font-medium text-[var(--bg-gradient-start)] transition-opacity hover:opacity-90"
          >
            Browse the collection <ArrowRight size={18} />
          </Link>
        </Glass>
      </section>
    </div>
  );
}
