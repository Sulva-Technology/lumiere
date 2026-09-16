import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AmbientBackground } from '@/components/ambient-background';
import { CartProvider } from '@/components/cart-context';
import { AppShell } from '@/components/app-shell';
import { getPublicStoreSettings } from '@/lib/data/public';
import { JsonLd } from '@/components/seo/JsonLd';

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
    alternates: {
      canonical: '/',
    },
    title: {
      default: store.storeName,
      template: `%s | ${store.storeName}`,
    },
    description: 'Expert makeup artist in Arizona specializing in Soft Glam and Full Glam for events, birthdays, photoshoots, and bridal occasions.',
    keywords: ['makeup artist in Arizona', 'Arizona makeup artist', 'soft glam makeup', 'full glam makeup', 'event makeup Arizona'],
    authors: [{ name: store.storeName }],
    creator: store.storeName,

    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: store.storeName,
      title: `Makeup Artist in Arizona | ${store.storeName}`,
      description: 'Book luxury Soft Glam and Full Glam makeup appointments for events, photoshoots, and special occasions.',
      images: [
        {
          url: '/images/logo.jpeg',
          width: 1200,
          height: 630,
          alt: `Makeup Artist in Arizona - ${store.storeName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Makeup Artist in Arizona | ${store.storeName}`,
      description: 'Luxury makeup artist in Arizona specializing in high-end event and editorial looks.',
      images: ['/images/logo.jpeg'],
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: '/images/logo.jpeg',
      shortcut: '/images/logo.jpeg',
      apple: '/images/logo.jpeg',
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await getPublicStoreSettings();
  const siteUrl = 'https://itzlolabeauty.com';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        'name': store.storeName,
        'url': siteUrl,
        'logo': {
          '@type': 'ImageObject',
          'url': `${siteUrl}/images/logo.jpeg`,
          'width': '512',
          'height': '512'
        },
        'sameAs': []
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        'url': siteUrl,
        'name': store.storeName,
        'publisher': { '@id': `${siteUrl}/#organization` }
      },
      {
        '@type': 'BeautySalon',
        '@id': `${siteUrl}/#salon`,
        'name': store.storeName,
        'description': 'Luxury makeup artistry by Lola in Arizona.',
        'url': siteUrl,
        'telephone': store.supportPhone,
        'address': {
          '@type': 'PostalAddress',
          'addressRegion': 'AZ',
          'addressCountry': 'US'
        },
        'image': `${siteUrl}/images/logo.jpeg`,
        'priceRange': '$$',
        'parentOrganization': { '@id': `${siteUrl}/#organization` },
        'knowsAbout': ['Makeup Artistry', 'Event Makeup', 'Bridal Makeup', 'Beauty Education']
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        <JsonLd data={schema} />
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
            <AppShell brandName={store.storeName}>
              {children}
            </AppShell>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
