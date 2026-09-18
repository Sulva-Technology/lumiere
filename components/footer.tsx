'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


type FooterProps = {
  brandName: string;
};

export function Footer({ brandName }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer
      className="relative z-10 mt-auto overflow-hidden border-t border-[rgba(139,68,17,0.16)] bg-white"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(139,105,20,0.45)] to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,0.9fr)] lg:gap-16 lg:py-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[rgba(139,68,17,0.16)] bg-white/80 shadow-[0_12px_40px_rgba(20,13,5,0.08)]">
              <Image src="/images/logo.jpeg" alt={`${brandName} logo`} fill className="object-cover" sizes="64px" />
            </div>
            <div>
              <span className="font-serif text-2xl tracking-[0.14em] uppercase text-[var(--text-primary)] sm:text-3xl">{brandName}</span>
            </div>
          </div>
        </div>

        <div className="md:justify-self-center">
          <h4 className="mb-4 font-serif text-lg text-[#4A2109]">Explore</h4>
          <div className="flex flex-col gap-3">
            <Link href="/" className="cursor-pointer text-sm text-[#6A3A1C] transition-colors hover:text-[#8B4411]">
              Home
            </Link>
            <Link href="/#about" className="cursor-pointer text-sm text-[#6A3A1C] transition-colors hover:text-[#8B4411]">
              About Lola
            </Link>
            <Link href="/book" className="cursor-pointer text-sm text-[#6A3A1C] transition-colors hover:text-[#8B4411]">
              Book Now
            </Link>
            <Link href="/contact" className="cursor-pointer text-sm text-[#6A3A1C] transition-colors hover:text-[#8B4411]">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-lg text-[#4A2109]">Information</h4>
          <div className="flex flex-col gap-3">
            <Link href="/terms-of-service" className="cursor-pointer text-sm text-[#6A3A1C] transition-colors hover:text-[#8B4411]">
              Terms & Conditions
            </Link>
          </div>
        </div>

      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[rgba(139,68,17,0.16)] px-6 py-6 text-sm text-[#6A3A1C] sm:flex-row sm:items-center sm:justify-between">
        <p>Copyright {new Date().getFullYear()} {brandName}. All rights reserved.</p>
        <p className="text-xs uppercase tracking-[0.22em]">Luxury Glam. Book confidently.</p>
      </div>
    </footer>
  );
}


