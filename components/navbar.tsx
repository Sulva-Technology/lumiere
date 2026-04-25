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
  { label: 'Services', href: '/#services' },
  { label: 'Portfolio', href: '/#portfolio' },
  { label: 'About', href: '/about' },
  { label: 'Policies', href: '/policies' },
  { label: 'Contact', href: '/contact' },
];

function isActivePath(currentPath: string | null, href: string) {
  if (href.includes('#')) return false;
  const normalizedHref = href.split('#')[0] || '/';
  return currentPath === normalizedHref;
}

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

  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  const isHomeHeroTop = pathname === '/' && !scrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 py-3 transition-all duration-500 sm:px-6 sm:py-4">
      <div
        className={cn(
          'mx-auto max-w-7xl rounded-[32px] border px-3 py-2.5 transition-all duration-500 sm:px-5 sm:py-3',
          scrolled
            ? 'bg-[rgba(154,177,143,0.18)] dark:bg-[rgba(108,139,103,0.12)] backdrop-blur-2xl border-[rgba(58,77,57,0.22)] dark:border-[rgba(154,177,143,0.2)] shadow-lg'
            : 'bg-transparent border-transparent'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <nav className="hidden min-w-0 flex-1 items-center gap-5 lg:flex xl:gap-7">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'text-sm font-medium tracking-[0.01em] transition-colors',
                  isActivePath(pathname, item.href)
                    ? 'text-heading-primary'
                    : 'text-text-secondary hover:text-heading-primary',
                  !scrolled && pathname === '/' && 'text-white/90 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="min-w-0 flex-1 lg:flex-none">
            <Link href="/" className="flex items-center">
              <div
                className={cn(
                  'glass-subtle inline-flex max-w-[clamp(11rem,42vw,16rem)] items-center gap-2 rounded-full px-3 py-2 sm:max-w-[18rem] sm:gap-3 sm:px-4 lg:max-w-none lg:px-5',
                  isHomeHeroTop && 'border-white/18 bg-black/18'
                )}
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[rgba(58,77,57,0.18)] bg-white/70 sm:h-10 sm:w-10">
                  <Image src="/images/logo.jpeg" alt={`${brandName} logo`} fill className="object-cover" sizes="40px" />
                </div>
                <span className={cn('truncate font-serif text-[13px] tracking-[0.14em] uppercase min-[430px]:text-sm sm:text-base lg:text-lg', isHomeHeroTop ? 'text-white' : 'text-heading-primary')}>
                  <span className="min-[430px]:hidden">Itz Lola</span>
                  <span className="hidden min-[430px]:inline">{brandName}</span>
                </span>
              </div>
            </Link>
          </div>

          <div className="flex flex-none items-center justify-end gap-2 sm:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={cn(
                'glass-subtle flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5 lg:hidden',
                isHomeHeroTop && 'border-white/18 bg-black/18 text-white hover:bg-white/10'
              )}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <button
              onClick={toggleTheme}
              className={cn(
                'glass-subtle group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5',
                isHomeHeroTop && 'border-white/18 bg-black/18 hover:bg-white/10'
              )}
              aria-label={themeLabel}
              title={themeLabel}
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
                  className={cn('absolute inset-0 text-[var(--text-accent)]', isHomeHeroTop && 'text-white')}
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
                  className={cn('absolute inset-0 text-[var(--text-primary)]', isHomeHeroTop && 'text-white')}
                >
                  <Sun size={20} />
                </motion.div>
              </div>
            </button>

            <button
              onClick={openCart}
              className={cn(
                'glass-subtle relative hidden h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:flex',
                isHomeHeroTop && 'border-white/18 bg-black/18 hover:bg-white/10'
              )}
              aria-label="Open cart"
            >
              <ShoppingBag size={20} className={cn('text-[var(--text-primary)]', isHomeHeroTop && 'text-white')} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3A4D39] px-1 text-[10px] font-semibold text-white dark:bg-[#9ab18f] dark:text-[#102014]">
                  {itemCount}
                </span>
              )}
            </button>

            <Link
              href="/book"
              className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-forest-950 px-5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 dark:bg-accent-gold dark:text-forest-950 sm:px-6"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mx-auto mt-3 max-w-7xl px-1 lg:hidden">
          <div className="rounded-2xl border border-[rgba(58,77,57,0.22)] bg-[rgba(247,247,242,0.88)] p-2 shadow-lg backdrop-blur-xl dark:border-[rgba(154,177,143,0.2)] dark:bg-[rgba(15,24,18,0.88)]">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'block rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActivePath(pathname, item.href)
                    ? 'bg-[rgba(154,177,143,0.2)] dark:bg-[rgba(108,139,103,0.16)] text-[#3A4D39] dark:text-[#d7e0d0]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 block rounded-xl bg-[#3A4D39] px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95 dark:bg-[#D4A847] dark:text-[#102014]"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

