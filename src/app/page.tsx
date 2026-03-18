import Link from 'next/link'
import { ArrowRight, Zap, Shield, Truck, Clock, Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getFeaturedCatalogProducts } from '@/lib/catalog'
import { ProductCard } from '@/components/products/ProductCard'
import type { CatalogProduct } from '@/types/catalog'

/** Modawhale.to product image URLs (home page only). Source: https://modawhale.to/ */
const MODAWHALE_IMAGE_BASE = 'https://modawhale.to/wp-content/uploads/2022/06'
const MODAWHALE_PRODUCT_IMAGES: Record<string, string> = {
  modalert: `${MODAWHALE_IMAGE_BASE}/Copy-of-Products-2-400x400.png`,
  modvigil: `${MODAWHALE_IMAGE_BASE}/2-1-400x400.png`,
  waklert: `${MODAWHALE_IMAGE_BASE}/3-1-400x400.png`,
  artvigil: `${MODAWHALE_IMAGE_BASE}/4-1-400x400.png`,
}

function getModawhaleImageForProduct(product: CatalogProduct): string | null {
  const slug = product.slug.toLowerCase()
  for (const [key, url] of Object.entries(MODAWHALE_PRODUCT_IMAGES)) {
    if (slug.includes(key)) return url
  }
  return MODAWHALE_PRODUCT_IMAGES.modalert
}

const benefits = [
  {
    icon: Zap,
    title: 'Enhanced Focus',
    description: 'Experience laser-sharp concentration for 12-15 hours of peak productivity.',
  },
  {
    icon: Shield,
    title: 'Lab-Tested Quality',
    description: 'Every batch is tested for purity and potency. Only the best for our customers.',
  },
  {
    icon: Truck,
    title: 'Worldwide Shipping',
    description: 'Discreet packaging with tracking. Delivered to your door globally.',
  },
  {
    icon: Clock,
    title: 'Fast Processing',
    description: 'Orders processed within 24 hours. Express shipping options available.',
  },
]

const testimonials = [
  {
    name: 'Alex M.',
    role: 'Software Engineer',
    content: 'Noofox has been a game-changer for my productivity. The quality is consistently excellent, and shipping is always fast.',
    rating: 5,
  },
  {
    name: 'Sarah K.',
    role: 'Medical Student',
    content: "I've tried many vendors, but Noofox stands out for their reliability and customer service. Highly recommended!",
    rating: 5,
  },
  {
    name: 'James R.',
    role: 'Entrepreneur',
    content: 'The crypto payment option is perfect for privacy. Great products, great service, will definitely order again.',
    rating: 5,
  },
]

const stats = [
  { value: '30K+', label: 'Happy Customers' },
  { value: '98%', label: 'Satisfaction' },
  { value: '150+', label: 'Countries Served' },
  { value: '4.9/5', label: 'Customer Rating' },
]

/** Professional headshots + drinks for hero avatars (Unsplash) */
const HERO_AVATARS = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1544787219-7fcccc22f123?w=80&h=80&fit=crop&crop=face',
]

export default async function Home() {
  const featuredProducts = await getFeaturedCatalogProducts(8)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 sm:py-32 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Unlock Your{' '}
              <span className="text-primary">Cognitive Potential</span>
            </h1>
            <p className="text-muted-foreground">
              Trusted by 30,000+ customers worldwide
            </p>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Premium Modafinil and Armodafinil delivered worldwide. Experience
              enhanced focus, improved memory, and peak mental performance with
              our lab-tested cognitive enhancers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/shop">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {HERO_AVATARS.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted"
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                      width={40}
                      height={40}
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  4.9/5 from 2,300+ reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary">Why Choose Noofox</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              The Smart Choice for Cognitive Enhancement
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We&apos;re committed to providing the highest quality products with
              exceptional service and complete customer satisfaction.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-card/50 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <Badge variant="secondary">Featured Products</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Our Best Sellers
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Discover our most popular cognitive enhancers, trusted by
                thousands of customers worldwide.
              </p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/shop">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                imageUrlOverride={getModawhaleImageForProduct(product)}
              />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/shop">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary">How It Works</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, Secure, Fast
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Getting your cognitive enhancers has never been easier. Follow these
              simple steps.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Choose Your Product',
                description: 'Browse our selection of premium Modafinil and Armodafinil products.',
              },
              {
                step: '02',
                title: 'Secure Payment',
                description: 'Pay with crypto directly or use card via our secure on-ramp partner.',
              },
              {
                step: '03',
                title: 'Fast Delivery',
                description: 'Receive your order in discreet packaging with full tracking.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 2 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full -translate-x-1/2 bg-border md:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-2xl font-bold text-primary">
                    {item.step}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-card/50 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary">Testimonials</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              What Our Customers Say
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mt-4 text-muted-foreground">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 sm:px-12 sm:py-24">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to Enhance Your Performance?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join thousands of satisfied customers who have unlocked their
                cognitive potential with Noofox.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              'SSL Secured',
              '100% Authentic',
              'Money Back Guarantee',
              'Discreet Packaging',
              '24/7 Support',
            ].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
