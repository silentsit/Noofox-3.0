import { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy | Noofox",
  description: "Learn how Noofox collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: January 1, 2024
          </p>
        </div>

        <div className="mt-12 space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              1. Introduction
            </h2>
            <p className="mt-4">
              Noofox (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our
              website and make purchases.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. Information We Collect
            </h2>
            <p className="mt-4">We collect information that you provide directly to us:</p>
            <ul className="mt-4 list-inside list-disc space-y-2">
              <li>Name and shipping address</li>
              <li>Email address</li>
              <li>Order information and history</li>
              <li>Communication records with customer support</li>
            </ul>
            <p className="mt-4">
              We do NOT collect or store credit card information. All card
              payments are processed through our third-party partner Guardarian.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. How We Use Your Information
            </h2>
            <p className="mt-4">We use the information we collect to:</p>
            <ul className="mt-4 list-inside list-disc space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders</li>
              <li>Provide customer support</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. Information Sharing
            </h2>
            <p className="mt-4">
              We do not sell, trade, or otherwise transfer your personal
              information to third parties except:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2">
              <li>Shipping carriers (to deliver your orders)</li>
              <li>Payment processors (to process transactions)</li>
              <li>When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. Data Security
            </h2>
            <p className="mt-4">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. Data Retention
            </h2>
            <p className="mt-4">
              We retain your personal information for as long as necessary to
              fulfill the purposes for which it was collected, including to
              satisfy legal, accounting, or reporting requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. Your Rights
            </h2>
            <p className="mt-4">You have the right to:</p>
            <ul className="mt-4 list-inside list-disc space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at support@noofox.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              8. Cookies
            </h2>
            <p className="mt-4">
              We use cookies and similar tracking technologies to track activity
              on our website and improve your experience. You can control cookies
              through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              9. Changes to This Policy
            </h2>
            <p className="mt-4">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              10. Contact Us
            </h2>
            <p className="mt-4">
              If you have questions about this Privacy Policy, please contact us
              at:
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
