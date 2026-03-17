import { Metadata } from "next"
import { Suspense } from "react"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata: Metadata = {
  title: "Checkout | Noofox",
  description: "Complete your order with secure crypto payment.",
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutForm />
    </Suspense>
  )
}

function CheckoutLoading() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="h-64 rounded-xl bg-muted" />
              <div className="h-48 rounded-xl bg-muted" />
            </div>
            <div className="h-96 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
