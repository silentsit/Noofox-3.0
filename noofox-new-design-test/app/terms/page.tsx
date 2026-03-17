import { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service | Noofox",
  description: "Read the terms and conditions for using Noofox services.",
}

export default function TermsPage() {
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
          <Badge variant="secondary">Legal</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: January 1, 2024
          </p>
        </div>

        <div className="mt-12 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              1. Agreement to Terms
            </h2>
            <p className="mt-4">
              By accessing or using Noofox&apos;s website and services, you agree to
              be bound by these Terms of Service and all applicable laws and
              regulations. If you do not agree with any of these terms, you are
              prohibited from using our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. Eligibility
            </h2>
            <p className="mt-4">
              You must be at least 18 years old to use our services. By using
              our website, you represent and warrant that you are at least 18
              years of age and have the legal capacity to enter into this
              agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. Products and Services
            </h2>
            <p className="mt-4">
              Noofox provides cognitive enhancement products for personal use.
              Our products are intended for use by adults seeking to improve
              focus, productivity, and cognitive function.
            </p>
            <p className="mt-4">
              Product descriptions, images, and specifications are provided for
              informational purposes. While we strive for accuracy, we do not
              guarantee that all information is error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. Orders and Payments
            </h2>
            <p className="mt-4">
              By placing an order, you agree to provide accurate and complete
              information. We reserve the right to refuse or cancel any order
              for any reason, including suspected fraud.
            </p>
            <p className="mt-4">
              All payments are processed through cryptocurrency or through our
              payment partner Guardarian. Prices are listed in USD and are
              subject to change without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. Shipping and Delivery
            </h2>
            <p className="mt-4">
              Delivery times are estimates and not guarantees. We are not
              responsible for delays caused by shipping carriers, customs, or
              other factors beyond our control.
            </p>
            <p className="mt-4">
              It is your responsibility to ensure that the products you order
              can be legally imported into your country. Noofox is not
              responsible for any customs issues or seized shipments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. Refunds and Returns
            </h2>
            <p className="mt-4">
              Due to the nature of our products, we do not accept returns.
              However, we offer a reshipment guarantee for orders that don&apos;t
              arrive or arrive damaged. Contact us within 30 days of the
              expected delivery date to arrange a reshipment or refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. Disclaimer
            </h2>
            <p className="mt-4">
              Our products are not intended to diagnose, treat, cure, or prevent
              any disease. Always consult with a healthcare professional before
              starting any new supplement or medication.
            </p>
            <p className="mt-4">
              Noofox is not responsible for any adverse effects resulting from
              the use of our products. Use at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              8. Limitation of Liability
            </h2>
            <p className="mt-4">
              To the maximum extent permitted by law, Noofox shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages arising out of your use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              9. Intellectual Property
            </h2>
            <p className="mt-4">
              All content on this website, including text, graphics, logos, and
              images, is the property of Noofox and is protected by intellectual
              property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              10. Changes to Terms
            </h2>
            <p className="mt-4">
              We reserve the right to modify these terms at any time. Changes
              will be effective immediately upon posting on this page. Your
              continued use of our services after any changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              11. Contact
            </h2>
            <p className="mt-4">
              For questions about these Terms of Service, contact us at:
            </p>
            <p className="mt-4">
              Email:{" "}
              <a
                href="mailto:support@noofox.com"
                className="text-primary hover:underline"
              >
                support@noofox.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
