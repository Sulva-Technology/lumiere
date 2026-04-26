'use client';

import { motion } from 'motion/react';
import { Glass } from '@/components/ui/glass';
import Link from 'next/link';
import { Check, Clock, DollarSign, Sparkles, Camera } from 'lucide-react';
import type { BookingService } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

export default function ServiceDetailClient({ service }: { service: BookingService }) {
  const Icon = service.serviceType === 'content' ? Camera : Sparkles;

  return (
    <article className="space-y-12">
      {/* Header Section */}
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--text-accent)]/10 text-[var(--text-accent)]">
            <Icon size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {service.serviceType === 'makeup' ? 'Makeup Artistry' : 'Content Creation'}
          </span>
        </div>
        <h1 className="font-serif text-5xl md:text-6xl text-[var(--text-primary)]">
          {service.name}
        </h1>
        {service.bestFor && (
          <p className="text-xl leading-relaxed text-[var(--text-secondary)]">
            {service.bestFor}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <div className="space-y-12">
          {service.included && service.included.length > 0 && (
            <section className="space-y-6">
              <h2 className="font-serif text-3xl text-[var(--text-primary)]">What's Included</h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {service.included.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                      <Check size={12} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {service.prepNotes && service.prepNotes.length > 0 && (
            <section className="space-y-6">
              <h2 className="font-serif text-3xl text-[var(--text-primary)]">Preparation Notes</h2>
              <div className="rounded-3xl border border-black/5 bg-black/5 p-8 dark:border-white/5 dark:bg-white/5">
                <ul className="space-y-4">
                  {service.prepNotes.map((note, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                      <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-accent)]" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
          
          <section className="space-y-6">
            <h2 className="font-serif text-3xl text-[var(--text-primary)]">Description</h2>
            <div className="text-base leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
              {service.description}
            </div>
          </section>
        </div>

        {/* Sidebar Card */}
        <aside className="h-fit space-y-6">
          <Glass level="heavy" className="p-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <DollarSign size={16} />
                    <span>Investment</span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)]">{formatCurrency(service.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Clock size={16} />
                    <span>Duration</span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)]">{service.durationMinutes} Minutes</span>
                </div>
              </div>
              
              <Link
                href={`/book?type=${service.serviceType}&service=${service.id}`}
                className="flex w-full items-center justify-center rounded-full bg-[#8B6914] py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] dark:bg-[#D4A847] dark:text-[#1A1008]"
              >
                Book Now
              </Link>
              <p className="text-center text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                Deposit required to secure date
              </p>
            </div>
          </Glass>
          
          <div className="px-4 text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              Have questions about this service? <br />
              <Link href="/contact" className="font-bold text-[var(--text-accent)] underline">Contact Damilola</Link>
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
