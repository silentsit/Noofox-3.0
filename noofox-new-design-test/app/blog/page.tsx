import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Clock, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { blogPosts, getFeaturedBlogPosts, getAllCategories } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Blog | Noofox",
  description: "Expert articles on Modafinil, Armodafinil, cognitive enhancement, and nootropics. Learn everything you need to know about smart drugs.",
}

export default function BlogPage() {
  const featuredPosts = getFeaturedBlogPosts()
  const categories = getAllCategories()

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary">Blog</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Insights & Guides
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Expert articles on cognitive enhancement, nootropics, and everything
            you need to know about Modafinil and Armodafinil.
          </p>
        </div>

        {/* Categories */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
            All Posts
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        {featuredPosts.length > 0 && (
          <div className="mt-12">
            <Link
              href={`/blog/${featuredPosts[0].slug}`}
              className="group block overflow-hidden rounded-3xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="relative aspect-video md:aspect-auto">
                  <Image
                    src={featuredPosts[0].image}
                    alt={featuredPosts[0].title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <Badge className="w-fit">{featuredPosts[0].category}</Badge>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight transition-colors group-hover:text-primary md:text-3xl">
                    {featuredPosts[0].title}
                  </h2>
                  <p className="mt-4 text-muted-foreground">
                    {featuredPosts[0].excerpt}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featuredPosts[0].author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(featuredPosts[0].publishedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredPosts[0].readTime}
                    </div>
                  </div>
                  <Button className="mt-6 w-fit" variant="outline">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* All Posts Grid */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold">All Articles</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                  <h3 className="mt-3 font-semibold transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{post.readTime}</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-20 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">Stay Updated</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Subscribe to our newsletter for the latest articles on cognitive
            enhancement and exclusive offers.
          </p>
          <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
