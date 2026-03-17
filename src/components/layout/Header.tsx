'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, ChevronDown, ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Home', href: '/' },
  {
    name: 'Products',
    href: '/shop',
    children: [
      { name: 'All Products', href: '/shop' },
      { name: 'Modafinil', href: '/category/modafinil' },
      { name: 'Armodafinil', href: '/category/armodafinil' },
    ],
  },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { items } = useCart()
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        setIsLoggedIn(!!user)
      })
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo — height fits nav bar, natural 4:1 aspect ratio */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/best_noofox_logo_3.png"
            alt="Noofox - Brain Hacks & Better Health"
            width={480}
            height={120}
            className="h-8 w-auto sm:h-9"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-8">
          {navigation.map((item) =>
            item.children ? (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    {item.name}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.name} asChild>
                      <Link href={child.href}>{child.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            )
          )}
        </div>

        {/* Right side: Cart, Auth, CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/checkout"
            className="relative flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {isLoggedIn ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <User className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            )}
            <Button asChild>
              <Link href="/shop">Shop Now</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <div className="flex flex-col gap-6 pt-6">
                {navigation.map((item) =>
                  item.children ? (
                    <div key={item.name} className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {item.name}
                      </span>
                      <div className="flex flex-col gap-2 pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  )
                )}
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  {isLoggedIn ? (
                    <Button variant="outline" asChild>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" asChild>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                  )}
                  <Button asChild>
                    <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
                      Shop Now
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
