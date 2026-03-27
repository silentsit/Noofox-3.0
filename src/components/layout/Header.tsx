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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
import { modafinilArmodafinilProducts, modaCombosItems } from '@/lib/headerNav'
import {
  SITE_LOGO_ALT,
  SITE_LOGO_HEIGHT,
  SITE_LOGO_SRC,
  SITE_LOGO_WIDTH,
} from '@/lib/branding'

/** Primary nav mirrors https://noofox.com (Modafinil, Moda Combos). */

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4 lg:px-8"
        aria-label="Primary"
      >
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src={SITE_LOGO_SRC}
            alt={SITE_LOGO_ALT}
            width={SITE_LOGO_WIDTH}
            height={SITE_LOGO_HEIGHT}
            className="h-8 w-auto sm:h-9"
            priority
          />
        </Link>

        {/* Desktop — matches noofox.com primary menu */}
        <div className="hidden lg:flex lg:items-center lg:gap-6 xl:gap-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-haspopup="menu"
              >
                Modafinil
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[min(100vw-2rem,36rem)] max-h-[min(70vh,28rem)] overflow-y-auto p-0"
            >
              <div className="sticky top-0 z-10 border-b border-border bg-popover px-3 py-2">
                <DropdownMenuItem asChild className="cursor-pointer font-medium">
                  <Link href="/shop">Shop — all products</Link>
                </DropdownMenuItem>
              </div>
              <div className="p-3">
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Products
                </DropdownMenuLabel>
                <ul className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                  {modafinilArmodafinilProducts.map((p) => (
                    <li key={p.slug}>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/${p.slug}`}>{p.name}</Link>
                      </DropdownMenuItem>
                    </li>
                  ))}
                </ul>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-haspopup="menu"
              >
                Moda Combos
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/nootropic-combos">All combos</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {modaCombosItems.map((c) => (
                <DropdownMenuItem key={c.slug} asChild className="cursor-pointer">
                  <Link href={`/${c.slug}`}>{c.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/checkout"
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
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
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
              <div className="flex flex-col gap-6 pt-6">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Modafinil
                  </span>
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="pl-2 text-sm font-medium text-primary"
                  >
                    Shop — all products
                  </Link>
                  <div className="flex max-h-[40vh] flex-col gap-1 overflow-y-auto pl-2">
                    {modafinilArmodafinilProducts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/${p.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-foreground">Moda Combos</span>
                  <Link
                    href="/nootropic-combos"
                    onClick={() => setMobileMenuOpen(false)}
                    className="pl-2 text-sm font-medium text-primary"
                  >
                    All combos
                  </Link>
                  <div className="flex flex-col gap-1 pl-2">
                    {modaCombosItems.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/${c.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-4">
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
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
