'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer({ brandName }: { brandName: string }) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="relative z-10 mt-auto border-t border-[rgba(58,77,57,0.16)] bg-[rgba(247,247,242,0.62)] backdrop-blur-xl dark:border-[rgba(154,177,143,0.12)] dark:bg-[rgba(15,24,18,0.62)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="max-w-xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[rgba(58,77,57,0.16)] bg-white/80">
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
            <Link href="/" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#3A4D39] dark:hover:text-[#9ab18f]">
              Home
            </Link>
            <Link href="/shop" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#3A4D39] dark:hover:text-[#9ab18f]">
              Shop
            </Link>
            <Link href="/about" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#3A4D39] dark:hover:text-[#9ab18f]">
              About
            </Link>
            <Link href="/book" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#3A4D39] dark:hover:text-[#9ab18f]">
              Book
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-[rgba(58,77,57,0.16)] px-6 py-6 dark:border-[rgba(154,177,143,0.12)]">
        <p className="text-sm text-[var(--text-secondary)]">Copyright {new Date().getFullYear()} {brandName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
