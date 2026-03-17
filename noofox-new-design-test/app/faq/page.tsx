import { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "FAQ | Noofox",
  description: "Frequently asked questions about ordering Modafinil and Armodafinil from Noofox. Learn about shipping, payments, and more.",
}

const faqCategories = [
  {
    category: "Ordering & Payments",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept cryptocurrency payments (Bitcoin, Ethereum, USDT, and Litecoin) and credit/debit card payments through our crypto on-ramp partner Guardarian. Card payments are converted to crypto, providing the same privacy benefits as direct crypto payments.",
      },
      {
        question: "How do I pay with cryptocurrency?",
        answer: "After checkout, you'll receive a wallet address and QR code. Simply send the exact amount to the provided address. Once the transaction is confirmed on the blockchain (usually within 10-30 minutes), your order will be processed.",
      },
      {
        question: "Can I pay with a credit card?",
        answer: "Yes! We've partnered with Guardarian to allow credit/debit card payments. You'll be redirected to Guardarian to purchase cryptocurrency, which is then sent directly to complete your order. This provides a seamless experience while maintaining privacy.",
      },
      {
        question: "Is my payment information secure?",
        answer: "Absolutely. We never store credit card information. Crypto payments are inherently secure and private. Card payments through Guardarian are processed by their secure, compliant platform.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        question: "Where do you ship to?",
        answer: "We ship to over 150 countries worldwide. Most orders are shipped from our fulfillment centers in India and Singapore, ensuring fast delivery times globally.",
      },
      {
        question: "How long does shipping take?",
        answer: "Delivery times vary by region: North America (7-14 days), Europe (7-14 days), Australia/NZ (10-18 days), Asia (10-18 days), South America (14-21 days). Express shipping options are available for faster delivery.",
      },
      {
        question: "Is shipping discreet?",
        answer: "Yes, all orders are shipped in plain, unmarked packaging with no indication of contents. The sender information is generic and doesn't mention our company name or product type.",
      },
      {
        question: "Do you provide tracking?",
        answer: "Yes, every order includes full tracking. You'll receive a tracking number via email once your order ships, allowing you to monitor delivery progress.",
      },
      {
        question: "What happens if my package is seized?",
        answer: "We offer a reshipment guarantee. If your package is seized or doesn't arrive, we'll reship your order for free or provide a full refund, depending on your preference.",
      },
    ],
  },
  {
    category: "Products & Quality",
    questions: [
      {
        question: "Are your products authentic?",
        answer: "Yes, all our products are 100% authentic and sourced directly from licensed pharmaceutical manufacturers including Sun Pharma, HAB Pharma, Healing Pharma, and HOF Pharmaceuticals.",
      },
      {
        question: "What's the difference between Modafinil and Armodafinil?",
        answer: "Modafinil is a racemic compound containing both R and S enantiomers. Armodafinil contains only the R-enantiomer, which is more pharmacologically active. Armodafinil typically has a longer duration of effects (15-18 hours vs 12-15 hours) and is often described as providing smoother, more sustained focus.",
      },
      {
        question: "Which product should I choose?",
        answer: "For beginners, we recommend Modalert or Modvigil. If you want longer-lasting effects, try Waklert or Artvigil. Our product pages include detailed comparisons to help you decide.",
      },
      {
        question: "What's the shelf life of your products?",
        answer: "All products have a minimum of 18 months shelf life remaining at the time of shipping. Store in a cool, dry place away from direct sunlight for best results.",
      },
    ],
  },
  {
    category: "Account & Support",
    questions: [
      {
        question: "Do I need to create an account?",
        answer: "No account is required to place an order. However, creating an account allows you to track orders, save shipping information, and access order history.",
      },
      {
        question: "How can I contact customer support?",
        answer: "You can reach us via email at support@noofox.com. We typically respond within 24 hours, 7 days a week. For urgent inquiries, please mention 'URGENT' in your subject line.",
      },
      {
        question: "What is your return policy?",
        answer: "Due to the nature of our products, we don't accept returns. However, we offer a reshipment guarantee if your order doesn't arrive or arrives damaged. Contact us within 30 days of the expected delivery date.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "Orders can be modified or cancelled within 2 hours of placement. After that, orders enter processing and cannot be changed. Contact us immediately if you need to make changes.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary">FAQ</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Find answers to common questions about ordering, shipping, products,
            and more. Can&apos;t find what you&apos;re looking for? Contact our support team.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="mt-12 space-y-12">
          {faqCategories.map((category) => (
            <div key={category.category}>
              <h2 className="text-xl font-semibold">{category.category}</h2>
              <Accordion type="single" collapsible className="mt-4">
                {category.questions.map((item, index) => (
                  <AccordionItem key={index} value={`${category.category}-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">Still Have Questions?</h2>
          <p className="mt-2 text-muted-foreground">
            Our support team is here to help. Reach out and we&apos;ll get back to
            you within 24 hours.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
