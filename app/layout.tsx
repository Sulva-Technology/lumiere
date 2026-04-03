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
  const siteUrl = 'https://thedmashop.com'; // Placeholder base URL

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `theDMAshop`,
      template: `%s | theDMAshop`,
    },

    description: 'A premium makeup artistry and digital content creation studio defined by high-end aesthetics and creative storytelling.',
    keywords: ['makeup artistry', 'content studio', 'digital content creation', 'editorial makeup', 'bridal glam', 'social media reels', 'studio sessions'],
    authors: [{ name: 'theDMAshop' }],
    creator: 'theDMAshop',

    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: store.storeName,
      title: `${store.storeName} | Makeup & Content Studio`,
      description: 'Defined by high-end aesthetics and professional creativity. Experience the new standard in makeup and content.',
      images: [
        {
          url: '/images/content_studio.png',
          width: 1200,
          height: 630,
          alt: store.storeName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${store.storeName} | Makeup & Content Studio`,
      description: 'Your premium destination for professional makeup and content creation.',
      images: ['/images/content_studio.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
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
