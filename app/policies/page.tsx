import type { Metadata } from 'next';
import Link from 'next/link';

import { policyPageSections } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Policies',
  description: 'Review Itz Lola Beauty booking policies for deposits, rescheduling, late arrivals, travel requests, payment expectations, and appointment prep.',
};

export default function PoliciesPage() {
  return (
    <main className="px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[36px] border border-[rgba(58,77,57,0.14)] bg-[linear-gradient(135deg,rgba(248,241,233,0.96),rgba(239,232,222,0.92))] px-6 py-10 shadow-[0_28px_90px_rgba(52,42,30,0.10)] sm:px-10 sm:py-14 dark:border-[rgba(154,177,143,0.14)] dark:bg-[linear-gradient(135deg,rgba(21,30,24,0.96),rgba(12,20,16,0.98))]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8B6914] dark:text-[#F0D080]">Policies</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl text-[var(--heading-primary)] sm:text-5xl dark:text-white">
            Clear expectations for a smooth, luxury booking experience.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)]">
            These policies are here to keep your appointment polished, timely, and stress-free without making the process feel intimidating.
          </p>
        </section>

        <section className="mt-10 grid gap-5">
          {policyPageSections.map((section) => (
            <article
              key={section.title}
              className="rounded-[28px] border border-[rgba(58,77,57,0.12)] bg-white/80 px-6 py-6 shadow-[0_20px_70px_rgba(43,49,38,0.06)] backdrop-blur-sm sm:px-8 dark:border-[rgba(154,177,143,0.14)] dark:bg-[rgba(12,21,16,0.74)]"
            >
              <h2 className="font-serif text-2xl text-[var(--heading-primary)] dark:text-white">{section.title}</h2>
              <div className="mt-4 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="leading-relaxed text-[var(--text-secondary)]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 flex flex-col gap-4 rounded-[32px] border border-[rgba(139,105,20,0.18)] bg-[rgba(139,105,20,0.08)] px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-[rgba(212,168,71,0.18)] dark:bg-[rgba(212,168,71,0.08)]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8B6914] dark:text-[#F0D080]">Need a custom timeline?</p>
            <h2 className="mt-3 font-serif text-2xl text-[var(--heading-primary)] dark:text-white">Bridal parties, travel appointments, and custom events are always reviewed with care.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact?service=Bridal%20Wedding%20Day%20Makeup" className="inline-flex items-center justify-center rounded-full bg-[#8B6914] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-[#D4A847] dark:text-[#1A1008]">
              Start an inquiry
            </Link>
            <Link href="/book" className="inline-flex items-center justify-center rounded-full border border-[rgba(58,77,57,0.18)] px-6 py-3 text-sm font-semibold text-[var(--heading-primary)] transition hover:bg-black/5 dark:border-[rgba(154,177,143,0.18)] dark:text-white dark:hover:bg-white/5">
              Book online
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
