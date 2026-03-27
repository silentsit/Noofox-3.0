import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { SocialProofToaster } from '@/components/social-proof/SocialProofToaster';
import { organizationJsonLd } from '@/lib/schema';
import { SITE_LOGO_ALT, SITE_LOGO_HEIGHT, SITE_LOGO_SRC, SITE_LOGO_WIDTH } from '@/lib/branding';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com';

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
    default: 'GrabModa | Premium Nootropics & Cognitive Enhancers',
    template: '%s | GrabModa',
  },
  description:
    'Premium nootropics delivered worldwide. Pay with crypto or card. Free shipping on every order.',
  applicationName: 'GrabModa',
  keywords: [
    'GrabModa',
    'nootropics',
    'modafinil',
    'armodafinil',
    'cognitive enhancers',
    'buy modafinil online',
  ],
  authors: [{ name: 'GrabModa', url: SITE }],
  creator: 'GrabModa',
  publisher: 'GrabModa',
  formatDetection: { email: false, address: false, telephone: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: 'GrabModa | Premium Nootropics & Cognitive Enhancers',
    description: 'Premium nootropics delivered worldwide. Pay with crypto or card.',
    type: 'website',
    url: SITE,
    siteName: 'GrabModa',
    locale: 'en_US',
    images: [
      { url: SITE_LOGO_SRC, width: SITE_LOGO_WIDTH, height: SITE_LOGO_HEIGHT, alt: SITE_LOGO_ALT },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GrabModa | Premium Nootropics & Cognitive Enhancers',
    description: 'Premium nootropics delivered worldwide. Pay with crypto or card.',
    creator: '@GrabModa',
    images: [`${SITE}${SITE_LOGO_SRC}`],
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
      <body className="min-h-screen-safe min-w-0 flex flex-col font-sans antialiased overflow-x-hidden pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
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
          <SocialProofToaster />
        </CartProvider>
      </body>
    </html>
  );
}
