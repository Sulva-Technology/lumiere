'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#about' },
  { label: 'Book', href: '/book' },
  { label: 'Contact', href: '/contact' },
];

export function NavBar({ brandName }: { brandName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 py-3 transition-all duration-500 sm:px-6 sm:py-4">
      <div
        className={cn(
          'max-w-7xl mx-auto flex items-center justify-between rounded-full border px-3 py-2.5 transition-all duration-500 sm:px-6 sm:py-3',
          scrolled
            ? 'bg-[rgba(201,147,97,0.18)] backdrop-blur-2xl border-[rgba(139,68,17,0.22)] shadow-lg'
            : 'bg-transparent border-transparent'
        )}
      >
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.filter((item) => item.href !== '/').map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'text-sm font-medium tracking-wide transition-colors',
                pathname === item.href ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mx-auto flex min-w-0 flex-1 justify-center px-2 md:absolute md:left-1/2 md:w-auto md:-translate-x-1/2 md:px-0">
          <Link href="/" className="flex items-center justify-center">
            <div className="glass-subtle flex items-center gap-2 rounded-full px-3 py-2 sm:gap-3 sm:px-6">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[rgba(139,68,17,0.18)] bg-white/70 sm:h-10 sm:w-10">
                <Image src="/images/logo.jpeg" alt={`${brandName} logo`} fill quality={95} className="object-cover" sizes="40px" />
              </div>
              <span className="hidden font-serif text-base tracking-[0.16em] uppercase text-[var(--text-primary)] sm:inline sm:text-lg">
                {brandName}
              </span>
              <span className="font-serif text-sm tracking-[0.12em] uppercase text-[var(--text-primary)] sm:hidden">
                itzlolabeauty
              </span>
            </div>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:ml-0">
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="glass-subtle rounded-full p-2 transition-colors hover:bg-black/5 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-full bg-[#8B4411] px-3 py-2 text-xs font-medium text-white shadow-md transition-opacity hover:opacity-90 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Book Now
          </Link>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mx-auto mt-3 max-w-7xl px-1 md:hidden">
          <div className="rounded-2xl border border-[rgba(139,68,17,0.22)] bg-white p-2 shadow-xl backdrop-blur-2xl">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'block rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-[rgba(201,147,97,0.2)] text-[#8B4411]'
                    : 'text-[#6A3A1C] hover:text-[#8B4411] hover:bg-black/5'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

