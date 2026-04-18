'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Menu,
  ChevronLeft,
  BarChart,
  CalendarCheck,
  X,
  LogOut,
  Store,
  Clock,
  WandSparkles,
  Mail,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const ADMIN_LINKS = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { name: 'Services', href: '/admin/services', icon: WandSparkles },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Payments', href: '/admin/reports', icon: BarChart },
  { name: 'Emails', href: '/admin/emails', icon: Mail },
  { name: 'Availability', href: '/admin/availability', icon: Clock },
  { name: 'Settings', href: '/admin/settings', icon: Settings },

];

export function AdminShell({ children, adminEmail, brandName }: { children: React.ReactNode; adminEmail: string; brandName: string }) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const activeLink =
    ADMIN_LINKS.find((link) => (link.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(link.href))) ?? ADMIN_LINKS[0];

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="relative z-50 flex min-h-screen bg-[#0c1510] text-white transition-colors duration-500">
      {isMobileSidebarOpen && (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed bottom-0 left-0 top-0 z-50 flex w-[280px] flex-col border-r border-[rgba(154,177,143,0.16)] bg-[rgba(12,21,16,0.96)] transition-transform duration-300',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-[80px]' : 'md:w-[280px]'
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-[rgba(154,177,143,0.16)] px-4 sm:px-6">
          {(!isCollapsed || isMobileSidebarOpen) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0 pr-3">
              <p className="truncate font-serif text-xl uppercase tracking-[0.12em] text-[#e4eadf] sm:text-2xl">
                {brandName}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[#9ab18f]/75">Admin Console</p>
            </motion.div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
               className="rounded-full border border-[rgba(154,177,143,0.16)] bg-[rgba(108,139,103,0.14)] p-2 text-[#d7e0d0] transition-colors hover:bg-[rgba(108,139,103,0.24)] md:hidden"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>

            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
               className="hidden rounded-full border border-[rgba(154,177,143,0.16)] bg-[rgba(108,139,103,0.14)] p-2 text-[#d7e0d0] transition-colors hover:bg-[rgba(108,139,103,0.24)] md:inline-flex"
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
                    className="absolute bottom-1 left-1 top-1 w-[calc(100%-8px)] rounded-[18px] border border-[rgba(154,177,143,0.25)] bg-[linear-gradient(135deg,rgba(108,139,103,0.24),rgba(58,77,57,0.44))]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div
                  className={cn(
                  'relative flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-colors',
                  isActive
                      ? 'text-[#eef2ea]'
                      : 'text-white/72 hover:bg-white/4 hover:text-[#eef2ea]'
                  )}
                >
                   <Icon size={20} className={isActive ? 'text-[#d7e0d0]' : 'text-[#9ab18f]'} />
                  {(!isCollapsed || isMobileSidebarOpen) && <span className="font-medium">{link.name}</span>}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-[rgba(154,177,143,0.16)] p-4">
          <div
            className={cn(
              'flex items-center gap-3 rounded-2xl border border-[rgba(154,177,143,0.16)] bg-[rgba(108,139,103,0.12)] p-3',
              isCollapsed && !isMobileSidebarOpen ? 'justify-center' : ''
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(108,139,103,0.24)] text-[#eef2ea]">
              <Store size={18} />
            </div>
            {(!isCollapsed || isMobileSidebarOpen) && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">Authorized Admin</p>
                <p className="truncate text-xs text-[#d7e0d0]/65">{adminEmail}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className={cn('ml-0 flex flex-1 flex-col transition-[margin] duration-300', isCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]')}>
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-[rgba(154,177,143,0.14)] bg-[rgba(12,21,16,0.84)] px-4 backdrop-blur-[18px] sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-full border border-[rgba(154,177,143,0.16)] bg-[rgba(108,139,103,0.12)] p-2 transition-colors hover:bg-[rgba(108,139,103,0.24)] md:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={20} className="text-[#d7e0d0]" />
            </button>
            <h1 className="font-serif text-xl text-[#eef2ea] sm:text-2xl">{activeLink.name}</h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="hidden text-sm font-medium text-[#d7e0d0]/72 transition-colors hover:text-[#eef2ea] sm:inline">
              View Storefront
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(154,177,143,0.16)] bg-[rgba(108,139,103,0.14)] px-4 py-2 text-sm font-medium text-[#eef2ea] transition-colors hover:bg-[rgba(108,139,103,0.24)]"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">{children}</main>
      </div>
    </div>
  );
}

