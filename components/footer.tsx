'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useTheme } from '@/components/theme-provider';

type FooterProps = {
  brandName: string;
};

export function Footer({ brandName }: FooterProps) {
  const pathname = usePathname();
  const { theme } = useTheme();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer
      className="relative z-10 mt-auto overflow-hidden border-t border-[rgba(58,77,57,0.16)] backdrop-blur-xl dark:border-[rgba(154,177,143,0.12)]"
      style={{
        background:
          theme === 'dark'
            ? 'linear-gradient(180deg, rgba(18,41,28,0.96) 0%, rgba(12,29,20,0.98) 100%)'
            : 'linear-gradient(180deg, rgba(231,237,225,0.94) 0%, rgba(219,228,214,0.96) 100%)',
      }}
    >
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
        </div>

        <div className="md:justify-self-center">
          <h4 className="mb-4 font-serif text-lg text-[#1b3121] dark:text-[var(--text-primary)]">Explore</h4>
          <div className="flex flex-col gap-3">
            <Link href="/" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Home
            </Link>
            <Link href="/book" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Book Now
            </Link>
            <Link href="/services" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Services
            </Link>
            <Link href="/contact" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-lg text-[#1b3121] dark:text-[var(--text-primary)]">Information</h4>
          <div className="flex flex-col gap-3">
            <Link href="/faq" className="cursor-pointer text-sm text-[#496052] transition-colors hover:text-[#3A4D39] dark:text-[var(--text-secondary)] dark:hover:text-[#9ab18f]">
              FAQ
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
        <p className="text-xs uppercase tracking-[0.22em]">Luxury Glam. Book confidently.</p>
      </div>
    </footer>
  );
}


