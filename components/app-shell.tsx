'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/navbar';
import { CartDrawer } from '@/components/cart-drawer';
import { Footer } from '@/components/footer';

type AppShellProps = {
  children: ReactNode;
  brandName: string;
};

export function AppShell({ children, brandName }: AppShellProps) {
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
      <NavBar brandName={brandName} />
      <CartDrawer />
      <main className="flex-1 pt-24 pb-16">{children}</main>
      <Footer brandName={brandName} />
    </>
  );
}
