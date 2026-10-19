'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Expand } from 'lucide-react';

import { GalleryLightbox } from '@/components/gallery-lightbox';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/lib/types';

const ALL = 'All looks';
const PREFERRED_ORDER = ['Soft Glam', 'Full Glam', 'Bridal', 'Editorial / Content'];

function orderCategories(categories: string[]) {
  return [...categories].sort((a, b) => {
    const rankA = PREFERRED_ORDER.indexOf(a);
    const rankB = PREFERRED_ORDER.indexOf(b);
    if (rankA !== -1 || rankB !== -1) return (rankA === -1 ? 99 : rankA) - (rankB === -1 ? 99 : rankB);
    return a.localeCompare(b);
  });
}

export default function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [category, setCategory] = useState(ALL);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = useMemo(
    () => orderCategories(Array.from(new Set(items.map((item) => item.category?.trim()).filter((value): value is string => Boolean(value))))),
    [items]
  );

  const visible = useMemo(
    () => (category === ALL ? items : items.filter((item) => item.category?.trim() === category)),
    [category, items]
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <header className="mx-auto mt-6 max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--text-accent)]">The portfolio</p>
        <h1 className="mt-3 font-serif text-4xl text-[var(--text-primary)] sm:text-5xl md:text-6xl">Real clients. Real glam.</h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
          Soft glam, full glam, bridal and event looks created for clients across Arizona. Tap any photo to see it up close, then book the
          look that feels like you.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/book" className="inline-flex w-full items-center justify-center rounded-full bg-[#8B4411] px-8 py-3.5 font-medium text-white shadow-md transition-opacity hover:opacity-90 sm:w-auto">
            Book Your Glam
          </Link>
          <Link href="/services" className="inline-flex w-full items-center justify-center rounded-full border border-[var(--text-primary)] px-8 py-3.5 font-medium text-[var(--text-primary)] transition-opacity hover:opacity-80 sm:w-auto">
            View Services
          </Link>
        </div>
      </header>

      {categories.length > 1 ? (
        <div className="-mx-4 mt-12 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter looks by style">
          <div className="flex w-max gap-2 sm:mx-auto sm:w-auto sm:flex-wrap sm:justify-center">
            {[ALL, ...categories].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCategory(option)}
                aria-pressed={category === option}
                className={cn(
                  'whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-medium transition-colors',
                  category === option
                    ? 'border-[#8B4411] bg-[#8B4411] text-white'
                    : 'border-[rgba(139,68,17,0.22)] bg-white/60 text-[var(--text-secondary)] hover:border-[#8B4411]/50 hover:text-[var(--text-primary)]'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <ul className={cn('grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3', categories.length > 1 ? 'mt-8' : 'mt-12')}>
        {visible.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-white text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B4411]"
              aria-label={`View larger: ${item.title ?? item.alt}`}
            >
              <Image
                src={item.imageUrl}
                alt={item.alt}
                fill
                quality={90}
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" aria-hidden />
              <span className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-[#4A2109] opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden>
                <Expand size={16} />
              </span>
              <span className="absolute inset-x-0 bottom-0 block p-4 text-white sm:p-5">
                {item.category ? <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-white/75">{item.category}</span> : null}
                {item.title ? <span className="mt-1 block font-serif text-xl sm:text-2xl">{item.title}</span> : null}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <section className="mt-16 rounded-[32px] border border-[rgba(139,68,17,0.16)] bg-white/70 px-6 py-10 text-center sm:px-10 sm:py-14">
        <h2 className="font-serif text-3xl text-[var(--text-primary)] sm:text-4xl">Saw a look you love?</h2>
        <p className="mx-auto mt-3 max-w-xl text-[var(--text-secondary)]">
          Choose your service, secure your date with a deposit, and arrive ready for your glam. Planning a wedding or a group? Send an inquiry
          and we&rsquo;ll build your day together.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/book" className="inline-flex w-full items-center justify-center rounded-full bg-[#8B4411] px-8 py-3.5 font-medium text-white shadow-md transition-opacity hover:opacity-90 sm:w-auto">
            Book Your Glam
          </Link>
          <Link href="/contact" className="inline-flex w-full items-center justify-center rounded-full border border-[var(--text-primary)] px-8 py-3.5 font-medium text-[var(--text-primary)] transition-opacity hover:opacity-80 sm:w-auto">
            Bridal &amp; Event Inquiry
          </Link>
        </div>
      </section>

      <GalleryLightbox items={visible} index={openIndex} onChange={setOpenIndex} />
    </div>
  );
}
