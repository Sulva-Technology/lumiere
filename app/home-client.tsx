'use client';

import { motion } from 'motion/react';
import { Glass } from '@/components/ui/glass';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { StoreSettings } from '@/lib/types';
import { applyStoreSettingsDefaults } from '@/lib/store-settings';

const headlineWords = 'Shop. Book the Session.'.split(' ');

export default function Home({ settings }: { settings: StoreSettings | null }) {
  const resolvedSettings = applyStoreSettingsDefaults(settings);
  const shopSectionTitle = resolvedSettings.home_shop_section_title || 'Shop';
  const shopSectionLinkLabel = resolvedSettings.home_shop_section_link_label || 'Shop Collection';
  const shopSectionLinkHref = resolvedSettings.home_shop_section_link_href || '/shop';
  const shopSectionItems = resolvedSettings.home_shop_section_items;

  return (
    <div className="flex flex-col gap-24">
      <section className="relative mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative h-[72vh] min-h-[520px] w-full overflow-hidden rounded-[32px] sm:min-h-[600px]">
          <motion.div
            className="absolute inset-0 z-0"
            animate={{ scale: [1.0, 1.05, 1.0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Image
              src="/images/home.jpeg"

              alt="Content Creation Studio"
              fill
              className="object-cover"
              style={{ objectPosition: 'center 30%' }}
              priority
            />
          </motion.div>


          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#F5F0EA]/90 via-transparent to-transparent dark:from-[#1A1008]/90" />

          <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
            <Glass level="heavy" className="flex w-full max-w-3xl flex-col items-center p-4 text-center sm:p-10 md:p-16">
              <div className="mb-5 hidden items-center gap-3 rounded-full border border-[#c8a03c]/20 bg-white/40 px-4 py-2 dark:bg-black/20 sm:flex">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image src="/images/logo.jpeg" alt="itzlolabeauty logo" fill className="object-cover" sizes="40px" />
                </div>
                <p className="text-xs uppercase tracking-[0.45em] text-[var(--text-secondary)]">itzlolabeauty</p>
              </div>

              <h1 className="mb-5 hidden flex-wrap justify-center gap-x-4 font-serif text-4xl font-medium tracking-tight sm:mb-6 sm:flex sm:text-5xl md:text-7xl">
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
                className="mb-8 hidden max-w-2xl text-base text-[var(--text-secondary)] sm:mb-10 sm:block sm:text-lg md:text-xl"
              >
                Discover premium makeup essentials or reserve a polished studio service built around makeup artistry and creator-ready content.

              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="flex flex-col items-center justify-center gap-3 sm:flex-row"
              >
                <Link
                  href="/book"
                  className="w-full rounded-full bg-[#8B6914] px-8 py-4 font-medium text-white shadow-lg transition-opacity hover:opacity-90 dark:bg-[#D4A847] dark:text-[#1A1008] sm:w-auto"
                >
                  Book your Glam
                </Link>
                {/* <Link
                  href="/shop"
                  className="w-full rounded-full border border-[var(--text-primary)] px-8 py-4 font-medium text-[var(--text-primary)] transition-opacity hover:opacity-90 sm:w-auto"
                >
                  Shop
                </Link> */}
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
          <h2 className="font-serif text-3xl md:text-4xl">Studio Services</h2>
          <Link href="/book" className="hidden items-center gap-2 text-sm font-medium text-[var(--text-accent)] transition-opacity hover:opacity-80 sm:flex">
            View All Services <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            {
              title: 'Makeup Artistry',
              description: 'Editorial glam, bridal, and personal artistry tailored to your unique features.',
              href: '/book?type=makeup',
              img: 'makeup.jpeg',
            },
            {
              title: 'Content Creation',
              description: 'Professional vertical video, brand photography, and social storytelling.',
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
                <Glass level="medium" className="relative flex aspect-[16/9] flex-col justify-end p-6 transition-transform duration-500 group-hover:scale-[1.02]">
                  <Image
                    src={`/images/${cat.img}`}

                    alt={cat.title}
                    fill
                    className="object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-80 dark:opacity-40 dark:group-hover:opacity-60"
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

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-10 flex items-end justify-between"
        >
          <h2 className="font-serif text-3xl md:text-4xl">{shopSectionTitle}</h2>
          <Link href={shopSectionLinkHref} className="hidden items-center gap-2 text-sm font-medium text-[var(--text-accent)] transition-opacity hover:opacity-80 sm:flex">
            {shopSectionLinkLabel} <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {shopSectionItems.map((item, index) => (
            <Glass key={`${item.title}-${index}`} level="medium" className="p-8">
              <h3 className="font-serif text-2xl">{item.title}</h3>
              <p className="mt-2 text-[var(--text-secondary)]">{item.description}</p>
            </Glass>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Glass level="heavy" className="p-8 text-center md:p-12">
          <h2 className="font-serif text-3xl md:text-5xl">Everything points to one of two outcomes: shop beautifully or book confidently.</h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            The storefront and service experience now work together, so clients can move quickly from discovery to purchase or appointment confirmation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--text-primary)] px-8 py-3 font-medium text-[var(--bg-gradient-start)] transition-opacity hover:opacity-90"
            >
              Book your Glam <ArrowRight size={18} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--text-primary)] px-8 py-3 font-medium text-[var(--text-primary)] transition-opacity hover:opacity-80"
            >
              Shop
            </Link>
          </div>
        </Glass>
      </section>

    </div>
  );
}
