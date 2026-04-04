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
  const siteUrl = 'https://itzlolabeauty.com';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: store.storeName,
      template: `%s | ${store.storeName}`,
    },
    description: 'itzlolabeauty is a founder-led beauty studio where clients can shop makeup essentials or book polished makeup and content sessions.',
    keywords: ['makeup artistry', 'content studio', 'digital content creation', 'editorial makeup', 'bridal glam', 'social media reels', 'studio sessions'],
    authors: [{ name: store.storeName }],
    creator: store.storeName,

    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: store.storeName,
      title: `${store.storeName} | Shop Makeup. Book Beauty.`,
      description: 'Shop beauty essentials or reserve a signature makeup or content session with itzlolabeauty.',
      images: [
        {
          url: '/images/logo.jpeg',
          width: 1200,
          height: 630,
          alt: store.storeName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${store.storeName} | Shop Makeup. Book Beauty.`,
      description: 'A founder-led beauty studio for makeup artistry, creator sessions, and beauty essentials.',
      images: ['/images/logo.jpeg'],
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
      <body className="relative min-h-screen flex flex-col overflow-x-hidden selection:bg-[#3A4D39]/20">
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
