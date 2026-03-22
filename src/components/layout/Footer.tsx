import Link from 'next/link'
import Image from 'next/image'
import {
  SITE_LOGO_ALT,
  SITE_LOGO_HEIGHT,
  SITE_LOGO_SRC,
  SITE_LOGO_WIDTH,
} from '@/lib/branding'

/**
 * Footer link columns mirror https://noofox.com (Astra footer widgets).
 * Paths align with this app’s routes; legacy WP URLs redirect in next.config.mjs where needed.
 */
const footerColumns = [
  {
    id: 'need-help',
    title: 'Need Help?',
    links: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Return Policy', href: '/return-policy' },
      { name: 'HTML Sitemap', href: '/html-sitemap' },
    ],
  },
  {
    id: 'info',
    title: 'Info',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Reviews', href: '/noofox-reviews' },
      { name: 'Shipping & Handling', href: '/shipping' },
    ],
  },
  {
    id: 'resources',
    title: 'Resources',
    links: [
      { name: 'Buy Modafinil Online', href: '/modafinil' },
      { name: 'Modafinil vs Armodafinil', href: '/blog/modafinil-vs-armodafinil' },
      { name: 'Modafinil vs Vyvanse', href: '/blog/modafinil-vs-vyvanse' },
      { name: 'Modafinil vs Adderall', href: '/blog/modafinil-vs-adderall' },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Column 1 — logo (matches live site primary footer section 1) */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex shrink-0 items-center">
              <Image
                src={SITE_LOGO_SRC}
                alt={SITE_LOGO_ALT}
                width={SITE_LOGO_WIDTH}
                height={SITE_LOGO_HEIGHT}
                className="h-9 w-auto max-w-[280px] sm:h-10"
                priority={false}
              />
            </Link>
          </div>

          {footerColumns.map((col) => (
            <div key={col.id}>
              <h3 className="text-base font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Below footer — copyright + Privacy | Terms (matches noofox.com) */}
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-left text-sm text-muted-foreground">
            © {new Date().getFullYear()} GrabModa. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground md:text-right">
            <Link href="/privacy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <span className="mx-2 text-border">|</span>
            <Link href="/terms" className="transition-colors hover:text-primary">
              Terms &amp; Conditions
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
