import type { Metadata } from 'next'
import Link from 'next/link'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com'

export const metadata: Metadata = {
  title: 'HTML Sitemap',
  description: 'Quick links to main pages on GrabModa.',
  alternates: { canonical: `${BASE}/html-sitemap` },
  robots: { index: true, follow: true },
}

const sections: { title: string; links: { name: string; href: string }[] }[] = [
  {
    title: 'Shop & categories',
    links: [
      { name: 'Shop all products', href: '/shop' },
      { name: 'Modafinil', href: '/modafinil' },
      { name: 'Armodafinil', href: '/armodafinil' },
    ],
  },
  {
    title: 'Information',
    links: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact', href: '/contact' },
      { name: 'Shipping', href: '/shipping' },
    ],
  },
  {
    title: 'Account & checkout',
    links: [
      { name: 'Checkout', href: '/checkout' },
      { name: 'Login', href: '/login' },
      { name: 'Sign up', href: '/signup' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
    ],
  },
]

export default function HtmlSitemapPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">HTML Sitemap</h1>
      <p className="mt-2 text-muted-foreground">
        Main pages on this site. For machine-readable sitemaps, see{' '}
        <Link href="/sitemap.xml" className="text-primary underline">
          sitemap.xml
        </Link>
        .
      </p>
      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted-foreground">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-primary hover:underline">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
