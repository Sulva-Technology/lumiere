'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Bell,
  Menu,
  ChevronLeft,
  BarChart,
  CalendarCheck,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const ADMIN_LINKS = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Reports', href: '/admin/reports', icon: BarChart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminShell({ children, adminEmail }: { children: React.ReactNode; adminEmail: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const activeLink =
    ADMIN_LINKS.find((link) => (link.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(link.href))) ?? ADMIN_LINKS[0];

  return (
    <div className="relative z-50 flex min-h-screen bg-[#F0EAE0] transition-colors duration-500 dark:bg-[#0F0A05]">
      {isMobileSidebarOpen && (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed bottom-0 left-0 top-0 z-50 flex w-[280px] flex-col border-r border-[#c8a03c]/20 bg-[#F0EAE0] transition-transform duration-300 dark:border-[#d4a847]/15 dark:bg-[#0F0A05]',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-[80px]' : 'md:w-[280px]'
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#c8a03c]/20 px-4 sm:px-6 dark:border-[#d4a847]/15">
          {(!isCollapsed || isMobileSidebarOpen) && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-2xl uppercase tracking-widest text-[#1A1008] dark:text-[#F0D080]">
              Lumiere
            </motion.span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="rounded-full bg-white/40 p-2 text-[#8B6914] transition-colors hover:bg-white/60 md:hidden dark:bg-black/40 dark:text-[#D4A847] dark:hover:bg-black/60"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>

            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden rounded-full bg-white/40 p-2 text-[#8B6914] transition-colors hover:bg-white/60 md:inline-flex dark:bg-black/40 dark:text-[#D4A847] dark:hover:bg-black/60"
              aria-label="Collapse sidebar"
            >
              {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
          {ADMIN_LINKS.map((link) => {
            const isActive = link.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link key={link.name} href={link.href} className="relative group" onClick={() => setIsMobileSidebarOpen(false)}>
                {isActive && (
                  <motion.div
                    layoutId="admin-active-tab"
                    className="absolute bottom-0 left-0 top-0 w-1 rounded-r-full bg-[#8B6914] dark:bg-[#D4A847]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div
                  className={cn(
                    'flex items-center gap-4 rounded-xl px-4 py-3 transition-colors',
                    isActive
                      ? 'bg-[rgba(240,210,140,0.2)] text-[#8B6914] dark:bg-[rgba(212,168,71,0.1)] dark:text-[#F0D080]'
                      : 'text-[#1A1008]/75 hover:bg-black/5 hover:text-[#8B6914] dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-[#F0D080]'
                  )}
                >
                  <Icon size={20} className={isActive ? 'text-[#8B6914] dark:text-[#D4A847]' : ''} />
                  {(!isCollapsed || isMobileSidebarOpen) && <span className="font-medium">{link.name}</span>}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-[#c8a03c]/20 p-4 dark:border-[#d4a847]/15">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl border border-[#c8a03c]/20 bg-[rgba(240,210,140,0.14)] p-2 dark:border-[#d4a847]/20 dark:bg-[rgba(212,168,71,0.08)]',
              isCollapsed && !isMobileSidebarOpen ? 'justify-center' : ''
            )}
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image
                src="https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80&w=100&h=100"
                alt="Admin"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {(!isCollapsed || isMobileSidebarOpen) && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-[#1A1008] dark:text-white">Admin User</p>
                <p className="truncate text-xs text-[var(--text-secondary)]">{adminEmail}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className={cn('ml-0 flex flex-1 flex-col transition-[margin] duration-300', isCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]')}>
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-[#c8a03c]/15 bg-[rgba(240,210,140,0.12)] px-4 backdrop-blur-[14px] sm:px-6 md:px-8 dark:border-[#d4a847]/10 dark:bg-[rgba(212,168,71,0.06)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-full bg-[rgba(240,210,140,0.2)] p-2 transition-colors hover:bg-[rgba(240,210,140,0.35)] md:hidden dark:bg-[rgba(212,168,71,0.1)] dark:hover:bg-[rgba(212,168,71,0.2)]"
              aria-label="Open sidebar"
            >
              <Menu size={20} className="text-[#8B6914] dark:text-[#D4A847]" />
            </button>
            <h1 className="font-serif text-xl text-[#1A1008] dark:text-[#F0D080] sm:text-2xl">{activeLink.name}</h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative rounded-full bg-[rgba(240,210,140,0.2)] p-2 transition-colors hover:bg-[rgba(240,210,140,0.4)] dark:bg-[rgba(212,168,71,0.1)] dark:hover:bg-[rgba(212,168,71,0.2)]">
              <Bell size={20} className="text-[#8B6914] dark:text-[#D4A847]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#8B6914] dark:bg-[#D4A847]" />
            </button>
            <Link href="/" className="hidden text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[#8B6914] dark:hover:text-[#F0D080] sm:inline">
              View Storefront
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
