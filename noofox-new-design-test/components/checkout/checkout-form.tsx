"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Bitcoin, CreditCard, Copy, Check, ExternalLink, Shield, Clock, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { products, type Product, type ProductVariant } from "@/lib/products"
import { cn } from "@/lib/utils"

// Placeholder wallet addresses
const walletAddresses = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  USDT: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  LTC: "ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
}

// Product images mapping
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

type CryptoType = keyof typeof walletAddresses

export function CheckoutForm() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("product")
  const pillsParam = searchParams.get("pills")

  const [product, setProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "card">("crypto")
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>("BTC")
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState<"details" | "payment" | "confirmation">("details")
  
  // Form state
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [postalCode, setPostalCode] = useState("")

  useEffect(() => {
    if (productId) {
      const foundProduct = products.find(p => p.id === productId)
      if (foundProduct) {
        setProduct(foundProduct)
        const pills = pillsParam ? parseInt(pillsParam) : foundProduct.variants[0].pills
        const variant = foundProduct.variants.find(v => v.pills === pills) || foundProduct.variants[0]
        setSelectedVariant(variant)
      }
    }
  }, [productId, pillsParam])

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddresses[selectedCrypto])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("payment")
  }

  const handlePaymentConfirm = () => {
    setStep("confirmation")
  }

  if (!product || !selectedVariant) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">No Product Selected</h1>
            <p className="mt-2 text-muted-foreground">
              Please select a product from our shop to proceed with checkout.
            </p>
            <Button asChild className="mt-6">
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const imageUrl = productImages[product.id] || productImages['modalert-200']

  if (step === "confirmation") {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-2xl px-4 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-6 text-2xl font-bold">Order Submitted!</h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for your order. We&apos;ll process it as soon as we confirm your payment.
            </p>
            <div className="mt-6 rounded-xl bg-muted p-4 text-left">
              <p className="text-sm font-medium">Order Details:</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedVariant.pills}x {product.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Total: ${selectedVariant.price}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Payment Method: {paymentMethod === "crypto" ? selectedCrypto : "Card via Guardarian"}
              </p>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              A confirmation email has been sent to <strong>{email}</strong>
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/product/${product.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product
          </Link>
        </Button>

        <h1 className="mt-6 text-3xl font-bold">Checkout</h1>

        {/* Progress Steps */}
        <div className="mt-6 flex items-center gap-2 sm:gap-4">
          <div className={cn(
            "flex items-center gap-2",
            step === "details" ? "text-primary" : "text-muted-foreground"
          )}>
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
              step === "details" ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              1
            </div>
            <span className="hidden text-sm font-medium sm:inline">Shipping Details</span>
            <span className="text-sm font-medium sm:hidden">Shipping</span>
          </div>
          <div className="h-px flex-1 bg-border" />
          <div className={cn(
            "flex items-center gap-2",
            step === "payment" ? "text-primary" : "text-muted-foreground"
          )}>
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
              step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              2
            </div>
            <span className="text-sm font-medium">Payment</span>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {step === "details" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitDetails}>
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Email Address</FieldLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Full Name</FieldLabel>
                        <Input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Street Address</FieldLabel>
                        <Input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="123 Main St"
                          required
                        />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                          <FieldLabel>City</FieldLabel>
                          <Input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="New York"
                            required
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Postal Code</FieldLabel>
                          <Input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="10001"
                            required
                          />
                        </Field>
                      </div>
                      <Field>
                        <FieldLabel>Country</FieldLabel>
                        <Input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="United States"
                          required
                        />
                      </Field>
                    </FieldGroup>
                    <Button type="submit" className="mt-6 w-full">
                      Continue to Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "crypto" | "card")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="crypto" className="flex items-center gap-2">
                        <Bitcoin className="h-4 w-4" />
                        Crypto
                      </TabsTrigger>
                      <TabsTrigger value="card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Card
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="crypto" className="mt-6">
                      {/* Crypto Selection */}
                      <div>
                        <label className="text-sm font-medium">Select Cryptocurrency</label>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {(Object.keys(walletAddresses) as CryptoType[]).map((crypto) => (
                            <button
                              key={crypto}
                              onClick={() => setSelectedCrypto(crypto)}
                              className={cn(
                                "rounded-xl border p-3 text-center transition-all",
                                selectedCrypto === crypto
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <span className="text-sm font-semibold">{crypto}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Wallet Address */}
                      <div className="mt-6">
                        <label className="text-sm font-medium">
                          Send ${selectedVariant.price} worth of {selectedCrypto} to:
                        </label>
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            value={walletAddresses[selectedCrypto]}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={copyAddress}
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* QR Code Placeholder */}
                      <div className="mt-6 flex flex-col items-center">
                        <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-border bg-muted">
                          <span className="text-sm text-muted-foreground">QR Code</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Scan to pay with {selectedCrypto}
                        </p>
                      </div>

                      <div className="mt-6 rounded-xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          <strong>Important:</strong> Send exactly ${selectedVariant.price} worth of {selectedCrypto}. 
                          Your order will be processed once the transaction is confirmed on the blockchain.
                        </p>
                      </div>

                      <Button onClick={handlePaymentConfirm} className="mt-6 w-full">
                        I&apos;ve Sent the Payment
                      </Button>
                    </TabsContent>

                    <TabsContent value="card" className="mt-6">
                      <div className="rounded-xl border border-border bg-muted/50 p-6 text-center">
                        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 font-semibold">Pay with Credit/Debit Card</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Card payments are processed through Guardarian, a secure crypto on-ramp service. 
                          You&apos;ll purchase crypto with your card and then pay for your order.
                        </p>
                        <Button asChild className="mt-6">
                          <a 
                            href={`https://guardarian.com/calculator?partner_api_token=PLACEHOLDER&default_fiat_amount=${selectedVariant.price}&default_crypto_currency=${selectedCrypto}&crypto_currencies_list=${selectedCrypto}&destination_address=${walletAddresses[selectedCrypto]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Continue with Guardarian
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                        <p className="mt-4 text-xs text-muted-foreground">
                          After completing the purchase on Guardarian, your crypto will be sent directly to our wallet.
                        </p>
                      </div>

                      <Button onClick={handlePaymentConfirm} variant="outline" className="mt-6 w-full">
                        I&apos;ve Completed Payment on Guardarian
                      </Button>
                    </TabsContent>
                  </Tabs>

                  <Button
                    variant="ghost"
                    className="mt-4 w-full"
                    onClick={() => setStep("details")}
                  >
                    Back to Shipping Details
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedVariant.pills} pills
                    </p>
                    <p className="mt-1 font-semibold text-primary">
                      ${selectedVariant.price}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedVariant.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-primary">Free</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${selectedVariant.price}
                  </span>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Free worldwide shipping</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Ships within 24 hours</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-6">
                  <p className="text-xs text-muted-foreground">
                    We accept:
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="secondary">BTC</Badge>
                    <Badge variant="secondary">ETH</Badge>
                    <Badge variant="secondary">USDT</Badge>
                    <Badge variant="secondary">LTC</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
