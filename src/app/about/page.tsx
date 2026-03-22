import { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Truck, HeartHandshake, Award, Users, Globe, ArrowRight } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about GrabModa - your trusted source for premium cognitive enhancers.',
  alternates: { canonical: `${BASE}/about` },
}

const values = [
  {
    icon: Shield,
    title: 'Quality First',
    description: 'Every product is sourced from licensed manufacturers and undergoes rigorous quality testing before shipping.',
  },
  {
    icon: HeartHandshake,
    title: 'Customer Focus',
    description: 'We prioritize customer satisfaction with responsive support, discreet packaging, and hassle-free returns.',
  },
  {
    icon: Truck,
    title: 'Reliable Delivery',
    description: 'Fast, tracked shipping to over 150 countries. Your order is processed within 24 hours of payment confirmation.',
  },
  {
    icon: Award,
    title: 'Trusted Experience',
    description: 'Serving over 50,000 satisfied customers worldwide with a 99.8% delivery success rate.',
  },
]

const stats = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '150+', label: 'Countries Served' },
  { value: '99.8%', label: 'Delivery Success' },
  { value: '24/7', label: 'Customer Support' },
]

export default function AboutPage() {
  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Hero */}
        <div className="text-center">
          <Badge variant="secondary">About GrabModa</Badge>
          <h1 className="mt-4 text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            Your Trusted Partner in{' '}
            <span className="text-primary">Cognitive Enhancement</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            GrabModa was founded with a simple mission: to provide access to
            high-quality cognitive enhancers with exceptional service and
            complete privacy.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-6 sm:mt-16 sm:gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0 text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="mt-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="secondary">Our Story</Badge>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                Built by Nootropic Enthusiasts
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  GrabModa started as a passion project by a group of professionals who
                  experienced firsthand the benefits of cognitive enhancers. Frustrated
                  with unreliable vendors and inconsistent quality, we decided to create
                  the service we wished existed.
                </p>
                <p>
                  Today, we&apos;ve grown to serve over 50,000 customers worldwide,
                  maintaining the same commitment to quality and service that started us
                  on this journey.
                </p>
                <p>
                  Our team includes pharmacologists, logistics experts, and customer
                  service professionals united by a shared belief in the potential of
                  cognitive enhancement.
                </p>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl border border-border bg-card">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-primary">
                    <span className="text-5xl font-bold text-primary-foreground">G</span>
                  </div>
                  <p className="mt-4 text-xl font-semibold">GrabModa</p>
                  <p className="text-sm text-muted-foreground">Est. 2020</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-20">
          <div className="text-center">
            <Badge variant="secondary">Our Values</Badge>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">What Sets Us Apart</h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Global Reach */}
        <div className="mt-20 rounded-3xl border border-border bg-card p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Globe className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-2xl font-bold sm:text-3xl">Worldwide Shipping</h2>
              <p className="mt-4 text-muted-foreground">
                We ship to over 150 countries with full tracking and discreet packaging.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Discreet, unmarked packaging
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  Full tracking on all orders
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Reshipment guarantee
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-sm sm:grid-cols-3 sm:gap-4">
              {[
                { region: 'North America', time: '7-14 days' },
                { region: 'Europe', time: '7-14 days' },
                { region: 'Australia/NZ', time: '10-18 days' },
                { region: 'Asia', time: '10-18 days' },
                { region: 'South America', time: '14-21 days' },
                { region: 'Other', time: '14-28 days' },
              ].map((item) => (
                <div key={item.region} className="rounded-xl border border-border bg-background p-3 sm:p-4">
                  <p className="text-xs font-medium sm:text-sm">{item.region}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Browse our selection of premium cognitive enhancers and experience the GrabModa difference.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/shop">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
