import { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Truck, Shield, Clock } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noofox.com'

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Learn about Noofox shipping options, delivery times, and policies.',
  alternates: { canonical: `${BASE}/shipping` },
}

export default function ShippingPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="mt-8">
          <Badge variant="secondary">Shipping</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Shipping Policy
          </h1>
          <p className="mt-4 text-muted-foreground">
            Free worldwide shipping on every order.
          </p>
        </div>

        <div className="mt-12 space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Truck className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">Free Shipping</h3>
              <p className="mt-1 text-sm text-muted-foreground">On all orders worldwide</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Clock className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">7-14 Days</h3>
              <p className="mt-1 text-sm text-muted-foreground">Average delivery time</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Shield className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">Discreet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Plain, unmarked packaging</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">Delivery Times</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { region: 'North America', time: '7-14 business days' },
                  { region: 'Europe', time: '7-14 business days' },
                  { region: 'Australia/NZ', time: '10-18 business days' },
                  { region: 'Asia', time: '10-18 business days' },
                  { region: 'South America', time: '14-21 business days' },
                  { region: 'Other regions', time: '14-28 business days' },
                ].map((item) => (
                  <div key={item.region} className="flex justify-between rounded-lg border border-border bg-background p-3">
                    <span className="text-sm font-medium text-foreground">{item.region}</span>
                    <span className="text-sm">{item.time}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Tracking</h2>
              <p className="mt-2 text-sm">
                Every order includes full tracking. You will receive a tracking number via email
                once your order has been dispatched.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Packaging</h2>
              <p className="mt-2 text-sm">
                All orders are shipped in plain, unmarked packaging with no indication of contents.
                The sender information is generic and does not mention our company name or product type.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">Reshipment Guarantee</h2>
              <p className="mt-2 text-sm">
                If your package is seized or does not arrive, we will reship your order for free
                or provide a full refund. Contact us within 30 days of the expected delivery date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
