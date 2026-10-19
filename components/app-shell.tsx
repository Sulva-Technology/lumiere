'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/navbar';
import { CartDrawer } from '@/components/cart-drawer';
import { Footer } from '@/components/footer';
import { AnalyticsTracker } from '@/components/analytics-tracker';

type AppShellProps = {
  children: ReactNode;
  brandName: string;
  galleryEnabled: boolean;
};

export function AppShell({ children, brandName, galleryEnabled }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <>
        <main className="flex-1">{children}</main>
      </>
    );
  }

  return (
    <>
      <AnalyticsTracker />
      <NavBar brandName={brandName} galleryEnabled={galleryEnabled} />
      <CartDrawer />
      <main className="flex-1 pt-24 pb-16">{children}</main>
      <Footer brandName={brandName} galleryEnabled={galleryEnabled} />
    </>
  );
}
