'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

type FooterProps = {
  brandName: string;
};

export function Footer({ brandName }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="relative z-10 mt-auto overflow-hidden border-t border-[rgba(58,77,57,0.16)] bg-[linear-gradient(180deg,rgba(231,237,225,0.94)_0%,rgba(219,228,214,0.96)_100%)] backdrop-blur-xl dark:border-[rgba(154,177,143,0.12)] dark:bg-[linear-gradient(180deg,rgba(18,41,28,0.96)_0%,rgba(12,29,20,0.98)_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(139,105,20,0.45)] to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,0.9fr)] lg:gap-16 lg:py-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[rgba(58,77,57,0.16)] bg-white/80 shadow-[0_12px_40px_rgba(16,24,16,0.08)]">
              <Image src="/images/logo.jpeg" alt={`${brandName} logo`} fill className="object-cover" sizes="64px" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--text-accent)]">Beauty Studio</p>
              <span className="font-serif text-2xl tracking-[0.14em] uppercase text-[var(--text-primary)] sm:text-3xl">{brandName}</span>
            </div>
          </div>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#496052] dark:text-[var(--text-secondary)] sm:text-lg">
            itzlolabeauty brings together beauty essentials, makeup artistry, and creator-ready sessions in one polished studio experience.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#8B6914] px-5 py-3 text-sm font-medium text-white shadow-[0_14px_34px_rgba(139,105,20,0.18)] transition-opacity hover:opacity-90 dark:bg-[#D4A847] dark:text-[#1A1008]"
            >
              Book Your Session <ArrowRight size={16} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(58,77,57,0.18)] bg-white/40 px-5 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[#8B6914] hover:text-[#8B6914] dark:border-[rgba(154,177,143,0.12)] dark:bg-transparent dark:hover:border-[#D4A847] dark:hover:text-[#D4A847]"
            >
              Shop Essentials
            </Link>
          </div>
        </div>

        <div className="md:justify-self-center">
          <h4 className="mb-4 font-serif text-lg text-[#1b3121] dark:text-[var(--text-primary)]">Explore</h4>
          <div className="flex flex-col gap-3">
            <Link href="/" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Home
            </Link>
            <Link href="/shop" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Shop
            </Link>
            <Link href="/book" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Book
            </Link>
            <Link href="/contact" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Contact
            </Link>
            <Link href="/track-order" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Track Order
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-lg text-[#1b3121] dark:text-[var(--text-primary)]">Information</h4>
          <div className="flex flex-col gap-3">
            <Link href="/faq" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              FAQ
            </Link>
            <Link href="/shipping-returns" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Shipping & Returns
            </Link>
            <Link href="/privacy-policy" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[rgba(58,77,57,0.16)] px-6 py-6 text-sm text-[#496052] sm:flex-row sm:items-center sm:justify-between dark:border-[rgba(154,177,143,0.12)] dark:text-[var(--text-secondary)]">
        <p>Copyright {new Date().getFullYear()} {brandName}. All rights reserved.</p>
        <p className="text-xs uppercase tracking-[0.22em]">Shop beauty. Book confidently.</p>
      </div>
    </footer>
  );
}


