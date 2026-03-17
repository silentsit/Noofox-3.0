import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'
import { getCatalogProducts } from '@/lib/catalog'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

const categoryInfo: Record<string, { title: string; description: string }> = {
  modafinil: {
    title: 'Modafinil Products',
    description:
      'Generic Modafinil products for enhanced focus and cognitive performance. Modafinil promotes wakefulness and improves concentration for 12-15 hours.',
  },
  armodafinil: {
    title: 'Armodafinil Products',
    description:
      'Armodafinil is the R-enantiomer of Modafinil, offering cleaner, longer-lasting cognitive enhancement for 15-18 hours without the peaks and troughs.',
  },
}

export async function generateStaticParams() {
  return [{ category: 'modafinil' }, { category: 'armodafinil' }]
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const info = categoryInfo[category]

  if (!info) {
    return { title: 'Category Not Found' }
  }

  return {
    title: info.title,
    description: info.description,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  const info = categoryInfo[category]

  if (!info) {
    notFound()
  }

  const allProducts = await getCatalogProducts()
  const products = allProducts.filter(
    (p) => p.category?.toLowerCase().includes(category.toLowerCase())
  )

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <nav className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
        </nav>

        <div className="text-center">
          <Badge variant="secondary" className="capitalize">{category}</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {info.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {info.description}
          </p>
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-4 mb-8">
            <Badge variant="outline">{products.length} products</Badge>
          </div>
          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No products found in this category.</p>
              <Button className="mt-4" asChild>
                <Link href="/shop">View All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
