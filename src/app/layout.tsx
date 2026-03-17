import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://noofox.com'),
  title: {
    default: 'Noofox | Premium Nootropics & Cognitive Enhancers',
    template: '%s | Noofox',
  },
  description:
    'Premium nootropics delivered worldwide. Pay with crypto or card. Free shipping on every order.',
  applicationName: 'Noofox',
  keywords: ['Noofox', 'nootropics', 'modafinil', 'armodafinil', 'cognitive enhancers'],
  openGraph: {
    title: 'Noofox | Premium Nootropics & Cognitive Enhancers',
    description: 'Premium nootropics delivered worldwide. Pay with crypto or card.',
    type: 'website',
    url: 'https://noofox.com',
    siteName: 'Noofox',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noofox | Premium Nootropics & Cognitive Enhancers',
    description: 'Premium nootropics delivered worldwide. Pay with crypto or card.',
    creator: '@Noofox',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen min-w-0 flex flex-col font-sans antialiased overflow-x-hidden">
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
