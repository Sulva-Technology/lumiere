'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, ShoppingBag, Menu, X } from 'lucide-react';
import { useTheme } from './theme-provider';
import { useCart } from './cart-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Stylists', href: '/book' },
  { label: 'About', href: '/about' },
];

export function NavBar() {
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
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-3 sm:py-4 transition-all duration-500">
      <div
        className={cn(
          'max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 transition-all duration-500 rounded-full border',
          scrolled
            ? 'bg-[#f0d28c]/18 dark:bg-[#d4a847]/10 backdrop-blur-2xl border-[#c8a03c]/30 dark:border-[#d4a847]/35 shadow-lg'
            : 'bg-transparent border-transparent'
        )}
      >
        {/* Left: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.filter((item) => item.href !== '/').map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'transition-colors text-sm font-medium tracking-wide',
                pathname === item.href ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Center: Logo */}
        <div className="shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2">
          <Link href="/" className="flex items-center justify-center">
            <div className="px-4 sm:px-6 py-2 rounded-full glass-subtle">
              <span className="font-serif text-lg sm:text-xl tracking-[0.2em] uppercase text-[var(--text-primary)]">
                Lumière
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4 md:ml-0">
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-full glass-subtle hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full glass-subtle hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative overflow-hidden group"
            aria-label="Toggle Theme"
          >
            <div className="relative w-5 h-5">
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
            className="relative p-2 rounded-full glass-subtle hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
            className="hidden md:flex items-center justify-center px-5 py-2.5 rounded-full bg-[#8B6914] dark:bg-[#D4A847] text-white dark:text-[#1A1008] text-sm font-medium hover:opacity-90 transition-opacity shadow-md"
          >
            Book a Stylist
          </Link>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 max-w-7xl mx-auto px-1">
          <div className="rounded-2xl border border-[#c8a03c]/30 dark:border-[#d4a847]/30 bg-[rgba(245,240,234,0.88)] dark:bg-[rgba(26,16,8,0.88)] backdrop-blur-xl p-2 shadow-lg">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
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
