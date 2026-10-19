'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import type { GalleryItem } from '@/lib/types';

type GalleryLightboxProps = {
  items: GalleryItem[];
  index: number | null;
  onChange: (index: number | null) => void;
};

const SWIPE_THRESHOLD = 50;

export function GalleryLightbox({ items, index, onChange }: GalleryLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const isOpen = index !== null && items.length > 0;
  const count = items.length;

  const close = useCallback(() => onChange(null), [onChange]);
  const show = useCallback(
    (step: number) => {
      if (index === null || count === 0) return;
      onChange((index + step + count) % count);
    },
    [count, index, onChange]
  );

  // Lock page scroll and move focus into the viewer only when it opens or closes.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') show(1);
      if (event.key === 'ArrowLeft') show(-1);
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [close, isOpen, show]);

  if (!isOpen || index === null) return null;

  const item = items[index];
  const hasMany = count > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title ? `${item.title} — enlarged photo` : 'Enlarged gallery photo'}
      className="fixed inset-0 z-[60] flex flex-col bg-[rgba(20,13,5,0.94)] backdrop-blur-sm"
      onClick={close}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) > SWIPE_THRESHOLD) show(delta < 0 ? 1 : -1);
      }}
    >
      <div className="flex items-center justify-between px-4 py-4 text-[#F7E7C1] sm:px-6" onClick={(event) => event.stopPropagation()}>
        <p className="text-xs uppercase tracking-[0.24em] text-[#e8d3bd]/80" aria-live="polite">
          {index + 1} / {count}
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={close}
          className="rounded-full border border-white/15 bg-white/10 p-2.5 transition-colors hover:bg-white/20"
          aria-label="Close photo"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 px-2 sm:px-20">
        <div className="relative h-full w-full" onClick={(event) => event.stopPropagation()}>
          <Image
            key={item.id}
            src={item.imageUrl}
            alt={item.alt}
            fill
            quality={95}
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {hasMany ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                show(-1);
              }}
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-3 text-[#F7E7C1] transition-colors hover:bg-white/20 sm:left-6 sm:block"
              aria-label="Previous photo"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                show(1);
              }}
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-3 text-[#F7E7C1] transition-colors hover:bg-white/20 sm:right-6 sm:block"
              aria-label="Next photo"
            >
              <ChevronRight size={24} />
            </button>
          </>
        ) : null}
      </div>

      <div
        className="flex flex-col items-center gap-4 px-4 pb-6 pt-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="min-w-0">
          {item.category ? <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#C99361]">{item.category}</p> : null}
          {item.title ? <p className="mt-1 font-serif text-2xl text-[#F7E7C1] sm:text-3xl">{item.title}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          {hasMany ? (
            <div className="flex gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => show(-1)}
                className="rounded-full border border-white/15 bg-white/10 p-3 text-[#F7E7C1]"
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => show(1)}
                className="rounded-full border border-white/15 bg-white/10 p-3 text-[#F7E7C1]"
                aria-label="Next photo"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ) : null}
          <Link
            href="/book"
            onClick={close}
            className="inline-flex items-center justify-center rounded-full bg-[#8B4411] px-7 py-3 text-sm font-medium text-white shadow-lg transition-opacity hover:opacity-90"
          >
            Book this look
          </Link>
        </div>
      </div>
    </div>
  );
}
