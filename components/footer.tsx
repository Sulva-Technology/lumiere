'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="relative z-10 border-t border-[#c8a03c]/20 dark:border-[#d4a847]/15 bg-[rgba(245,240,234,0.6)] dark:bg-[rgba(26,16,8,0.6)] backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <span className="font-serif text-2xl tracking-widest uppercase text-[var(--text-primary)]">
              Lumière
            </span>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Premium hair extensions, natural care, and elite stylist booking. Elevate your beauty with our luxurious collections.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[#8B6914] dark:hover:text-[#D4A847] hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[#8B6914] dark:hover:text-[#D4A847] hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[#8B6914] dark:hover:text-[#D4A847] hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-[var(--text-primary)] mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Shop Extensions', href: '/shop' },
                { label: 'Hair Care', href: '/shop' },
                { label: 'Book a Stylist', href: '/book' },
                { label: 'Our Story', href: '/about' }
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[var(--text-secondary)] hover:text-[#8B6914] dark:hover:text-[#D4A847] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-lg text-[var(--text-primary)] mb-6">Customer Care</h4>
            <ul className="space-y-3">
              {['FAQ', 'Shipping & Returns', 'Track Order', 'Contact Us'].map(link => (
                <li key={link}>
                  <Link href="#" className="text-sm text-[var(--text-secondary)] hover:text-[#8B6914] dark:hover:text-[#D4A847] transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif text-lg text-[var(--text-primary)] mb-6">Join the List</h4>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full pl-4 pr-12 py-3 rounded-full bg-white/40 dark:bg-black/40 border border-[#c8a03c]/30 dark:border-[#d4a847]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B6914]/50 dark:focus:ring-[#D4A847]/50 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-all"
              />
              <button type="submit" className="absolute right-1 top-1 bottom-1 aspect-square rounded-full bg-[#8B6914] dark:bg-[#D4A847] text-white dark:text-[#1A1008] flex items-center justify-center hover:opacity-90 transition-opacity">
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#c8a03c]/20 dark:border-[#d4a847]/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            © {new Date().getFullYear()} Lumière. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-[var(--text-secondary)] hover:text-[#8B6914] dark:hover:text-[#D4A847] transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-[var(--text-secondary)] hover:text-[#8B6914] dark:hover:text-[#D4A847] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
