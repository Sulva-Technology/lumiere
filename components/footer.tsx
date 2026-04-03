'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer({ brandName }: { brandName: string }) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="relative z-10 mt-auto border-t border-[#c8a03c]/20 bg-[rgba(245,240,234,0.6)] backdrop-blur-xl dark:border-[#d4a847]/15 dark:bg-[rgba(26,16,8,0.6)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
        <div className="max-w-xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#c8a03c]/20 bg-white/80">
              <Image src="/images/logo.jpeg" alt={`${brandName} logo`} fill className="object-cover" sizes="56px" />
            </div>
            <span className="font-serif text-2xl tracking-widest uppercase text-[var(--text-primary)]">{brandName}</span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            itzlolabeauty brings together beauty essentials, makeup artistry, and creator-ready sessions in one polished studio experience.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-lg text-[var(--text-primary)]">Explore</h4>
          <div className="flex flex-col gap-3">
            <Link href="/" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#8B6914] dark:hover:text-[#D4A847]">
              Home
            </Link>
            <Link href="/shop" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#8B6914] dark:hover:text-[#D4A847]">
              Shop
            </Link>
            <Link href="/book" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#8B6914] dark:hover:text-[#D4A847]">
              Book
            </Link>
            <Link href="/track-order" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#8B6914] dark:hover:text-[#D4A847]">
              Track Order
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-lg text-[var(--text-primary)]">Support</h4>
          <div className="flex flex-col gap-3">
            <Link href="/faq" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#8B6914] dark:hover:text-[#D4A847]">
              FAQ
            </Link>
            <Link href="/shipping-returns" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#8B6914] dark:hover:text-[#D4A847]">
              Shipping & Returns
            </Link>
            <Link href="/contact" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#8B6914] dark:hover:text-[#D4A847]">
              Contact
            </Link>
            <Link href="/privacy-policy" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#8B6914] dark:hover:text-[#D4A847]">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#8B6914] dark:hover:text-[#D4A847]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-[#c8a03c]/20 px-6 py-6 dark:border-[#d4a847]/15">
        <p className="text-sm text-[var(--text-secondary)]">Copyright {new Date().getFullYear()} {brandName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
