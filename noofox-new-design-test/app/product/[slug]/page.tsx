import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { products, getProductBySlug, getProductsByCategory } from "@/lib/products"
import { ProductCard } from "@/components/products/product-card"
import { ProductPurchaseForm } from "@/components/products/product-purchase-form"
import { CheckCircle, Truck, Shield, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

// Map product IDs to whalefriend images
const productImages: Record<string, string> = {
  'modalert-200': 'https://whalefriend-shop.lovable.app/lovable-uploads/47ed6a6e-27f4-4d1b-af9a-0dc61d7d2de9.png',
  'modvigil-200': 'https://whalefriend-shop.lovable.app/lovable-uploads/ca2fb5b9-5af5-47c3-8a18-f6b9bbb3ad97.png',
  'modaheal-200': 'https://whalefriend-shop.lovable.app/lovable-uploads/bcfe1e2b-ce80-4d12-84d7-4f14e9f61f9b.png',
  'modawake-200': 'https://whalefriend-shop.lovable.app/lovable-uploads/e18e391a-2e45-4eea-946e-1bc56f6dbc1e.png',
  'vilafinil-200': 'https://whalefriend-shop.lovable.app/lovable-uploads/bcfe1e2b-ce80-4d12-84d7-4f14e9f61f9b.png',
  'modaxl-300': 'https://whalefriend-shop.lovable.app/lovable-uploads/47ed6a6e-27f4-4d1b-af9a-0dc61d7d2de9.png',
  'waklert-150': 'https://whalefriend-shop.lovable.app/lovable-uploads/ca2fb5b9-5af5-47c3-8a18-f6b9bbb3ad97.png',
  'artvigil-150': 'https://whalefriend-shop.lovable.app/lovable-uploads/e18e391a-2e45-4eea-946e-1bc56f6dbc1e.png',
  'armodaxl-150': 'https://whalefriend-shop.lovable.app/lovable-uploads/bcfe1e2b-ce80-4d12-84d7-4f14e9f61f9b.png',
  'armodaxl-250': 'https://whalefriend-shop.lovable.app/lovable-uploads/47ed6a6e-27f4-4d1b-af9a-0dc61d7d2de9.png',
}

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  
  if (!product) {
    return { title: "Product Not Found | Noofox" }
  }

  return {
    title: `Buy ${product.name} | Noofox`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  
  if (!product) {
    notFound()
  }

  const relatedProducts = getProductsByCategory(product.category)
    .filter(p => p.id !== product.id)
    .slice(0, 3)

  const imageUrl = productImages[product.id] || productImages['modalert-200']

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
        </nav>

        {/* Product Section */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Product Image */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {product.featured && (
                  <Badge className="absolute left-4 top-4">Best Seller</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {product.category === 'modafinil' ? 'Modafinil' : 'Armodafinil'}
              </Badge>
              <Badge variant="outline">{product.dosage}</Badge>
              <Badge variant="outline">{product.manufacturer}</Badge>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">
              {product.description}
            </p>

            {/* Benefits */}
            <div className="mt-6 flex flex-wrap gap-2">
              {product.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  <CheckCircle className="h-4 w-4" />
                  {benefit}
                </div>
              ))}
            </div>

            <Separator className="my-8" />

            {/* Purchase Form */}
            <ProductPurchaseForm product={product} />

            <Separator className="my-8" />

            {/* Trust Badges */}
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-border p-3 sm:p-4">
                <Truck className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">Worldwide delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-3 sm:p-4">
                <Shield className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                <div>
                  <p className="text-sm font-medium">100% Authentic</p>
                  <p className="text-xs text-muted-foreground">Lab-tested quality</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-3 sm:p-4">
                <Clock className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                <div>
                  <p className="text-sm font-medium">Fast Processing</p>
                  <p className="text-xs text-muted-foreground">Ships within 24h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-3 sm:p-4">
                <CheckCircle className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                <div>
                  <p className="text-sm font-medium">Discreet Packaging</p>
                  <p className="text-xs text-muted-foreground">Privacy guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Accordion */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8">
          <h2 className="text-xl font-semibold">Product Information</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-medium">Active Ingredient</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {product.activeIngredient} {product.dosage}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Manufacturer</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {product.manufacturer}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Duration of Effects</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {product.category === 'modafinil' ? '12-15 hours' : '15-18 hours'}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Recommended Dosage</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {product.category === 'modafinil' 
                  ? '100-200mg once daily, in the morning'
                  : '75-150mg once daily, in the morning'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold">Related Products</h2>
            <p className="mt-2 text-muted-foreground">
              Other {product.category === 'modafinil' ? 'Modafinil' : 'Armodafinil'} products you might like
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
