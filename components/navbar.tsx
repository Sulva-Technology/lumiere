'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, ShoppingBag, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from './theme-provider';
import { useCart } from './cart-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Book', href: '/book' },
  { label: 'Shop', href: '/shop' },
];

export function NavBar({ brandName }: { brandName: string }) {
  const { theme, toggleTheme } = useTheme();
  const { openCart, itemCount } = useCart();
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
            ? 'bg-[#f0d28c]/18 dark:bg-[#d4a847]/10 backdrop-blur-2xl border-[#c8a03c]/30 dark:border-[#d4a847]/35 shadow-lg'
            : 'bg-transparent border-transparent'
        )}
      >
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.filter((item) => item.href !== '/').map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'text-sm font-medium tracking-wide transition-colors',
                pathname === item.href ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mx-auto flex min-w-0 flex-1 justify-center px-2 md:absolute md:left-1/2 md:w-auto md:-translate-x-1/2 md:px-0">
          <Link href="/" className="flex items-center justify-center">
            <div className="glass-subtle flex items-center gap-2 rounded-full px-3 py-2 sm:gap-3 sm:px-6">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#c8a03c]/25 bg-white/70 sm:h-10 sm:w-10">
                <Image src="/images/logo.jpeg" alt={`${brandName} logo`} fill className="object-cover" sizes="40px" />
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
            className="glass-subtle rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button
            onClick={toggleTheme}
            className="glass-subtle group relative overflow-hidden rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Toggle Theme"
          >
            <div className="relative h-5 w-5">
              <motion.div
                initial={false}
                animate={{
                  scale: theme === 'dark' ? 1 : 0,
                  opacity: theme === 'dark' ? 1 : 0,
                  rotate: theme === 'dark' ? 0 : -90,
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0 text-[var(--text-accent)]"
              >
                <Moon size={20} />
              </motion.div>
              <motion.div
                initial={false}
                animate={{
                  scale: theme === 'light' ? 1 : 0,
                  opacity: theme === 'light' ? 1 : 0,
                  rotate: theme === 'light' ? 0 : 90,
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0 text-[var(--text-primary)]"
              >
                <Sun size={20} />
              </motion.div>
            </div>
          </button>

          <button
            onClick={openCart}
            className="glass-subtle relative rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Open cart"
          >
            <ShoppingBag size={20} className="text-[var(--text-primary)]" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8B6914] px-1 text-[10px] font-semibold text-white dark:bg-[#D4A847] dark:text-[#1A1008]">
                {itemCount}
              </span>
            )}
          </button>

          <Link
            href="/book"
            className="hidden items-center justify-center rounded-full bg-[#8B6914] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-opacity hover:opacity-90 dark:bg-[#D4A847] dark:text-[#1A1008] md:flex"
          >
            Book Now
          </Link>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mx-auto mt-3 max-w-7xl px-1 md:hidden">
          <div className="rounded-2xl border border-[#c8a03c]/30 bg-[rgba(245,240,234,0.88)] p-2 shadow-lg backdrop-blur-xl dark:border-[#d4a847]/30 dark:bg-[rgba(26,16,8,0.88)]">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'block rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-[rgba(240,210,140,0.25)] dark:bg-[rgba(212,168,71,0.16)] text-[#8B6914] dark:text-[#F0D080]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
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

