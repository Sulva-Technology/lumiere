import type { Metadata } from 'next';
import Link from 'next/link';

import { FaqAccordion } from '@/components/faq-accordion';
import { faqItems } from '@/lib/marketing-content';
import { getPublicStoreSettings } from '@/lib/data/public';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about beauty bookings, bridal inquiries, service prep, and the Itz Lola Beauty appointment process.',
};

export default async function FaqPage() {
  const store = await getPublicStoreSettings();

  return (
    <main className="px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[36px] border border-[rgba(58,77,57,0.12)] bg-[linear-gradient(135deg,rgba(248,241,233,0.98),rgba(241,236,229,0.94))] px-6 py-10 shadow-[0_28px_90px_rgba(52,42,30,0.08)] sm:px-10 sm:py-14 dark:border-[rgba(154,177,143,0.14)] dark:bg-[linear-gradient(135deg,rgba(21,30,24,0.96),rgba(11,18,15,0.98))]">
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8B6914] dark:text-[#F0D080]">FAQ</p>
          <h1 className="mt-4 font-serif text-4xl text-[var(--heading-primary)] sm:text-5xl dark:text-white">
            Answers before you book, inquire, or plan your date.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)]">
            These are the questions most often asked before booking with {store.storeName}. If you need something more specific, reach out and we&apos;ll guide you.
          </p>
        </section>

        <FaqAccordion items={faqItems} className="mt-10" />

        <section className="mt-10 flex flex-col gap-4 rounded-[32px] border border-[rgba(139,105,20,0.18)] bg-[rgba(139,105,20,0.08)] px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-[rgba(212,168,71,0.18)] dark:bg-[rgba(212,168,71,0.08)]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8B6914] dark:text-[#F0D080]">Still deciding?</p>
            <h2 className="mt-3 font-serif text-2xl text-[var(--heading-primary)] dark:text-white">Book online for standard appointments or send an inquiry for bridal and custom beauty needs.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-[#8B6914] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-[#D4A847] dark:text-[#1A1008]">
              Book now
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-[rgba(58,77,57,0.18)] px-6 py-3 text-sm font-semibold text-[var(--heading-primary)] transition hover:bg-black/5 dark:border-[rgba(154,177,143,0.18)] dark:text-white dark:hover:bg-white/5">
              Send an inquiry
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
