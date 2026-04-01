import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AmbientBackground } from '@/components/ambient-background';
import { CartProvider } from '@/components/cart-context';
import { AppShell } from '@/components/app-shell';
import { getPublicStoreSettings } from '@/lib/data/public';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
});

export async function generateMetadata(): Promise<Metadata> {
  const store = await getPublicStoreSettings();

  return {
    title: `${store.storeName} | Beauty Shop`,
    description: 'A curated beauty storefront for premium hair and makeup collections.',
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await getPublicStoreSettings();

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var storedTheme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = storedTheme || (prefersDark ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.style.colorScheme = theme;
              } catch (error) {}
            })();
          `}
        </Script>
      </head>
      <body className="relative min-h-screen flex flex-col overflow-x-hidden selection:bg-[#D4A847]/30">
        <ThemeProvider>
          <CartProvider>
            <div className="noise-overlay" />
            <AmbientBackground />
            <AppShell brandName={store.storeName}>{children}</AppShell>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
