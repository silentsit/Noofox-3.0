import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { organizationJsonLd } from '@/lib/schema';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noofox.com';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Noofox | Premium Nootropics & Cognitive Enhancers',
    template: '%s | Noofox',
  },
  description:
    'Premium nootropics delivered worldwide. Pay with crypto or card. Free shipping on every order.',
  applicationName: 'Noofox',
  keywords: [
    'Noofox',
    'nootropics',
    'modafinil',
    'armodafinil',
    'cognitive enhancers',
    'buy modafinil online',
  ],
  authors: [{ name: 'Noofox', url: SITE }],
  creator: 'Noofox',
  publisher: 'Noofox',
  formatDetection: { email: false, address: false, telephone: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: 'Noofox | Premium Nootropics & Cognitive Enhancers',
    description: 'Premium nootropics delivered worldwide. Pay with crypto or card.',
    type: 'website',
    url: SITE,
    siteName: 'Noofox',
    locale: 'en_US',
    images: [{ url: '/best_noofox_logo_3.png', width: 1200, height: 300, alt: 'Noofox' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noofox | Premium Nootropics & Cognitive Enhancers',
    description: 'Premium nootropics delivered worldwide. Pay with crypto or card.',
    creator: '@Noofox',
    images: [`${SITE}/best_noofox_logo_3.png`],
  },
  category: 'health',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen min-w-0 flex flex-col font-sans antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <CartProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-1 min-w-0 w-full" role="main">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
