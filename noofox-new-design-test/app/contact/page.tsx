"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Mail, MessageSquare, Clock, CheckCircle } from "lucide-react"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send to an API
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-2xl px-4 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-6 text-2xl font-bold">Message Sent!</h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for contacting us. We&apos;ll get back to you within 24 hours.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary">Contact</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Have questions about your order, our products, or need assistance?
            We&apos;re here to help.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href="mailto:support@noofox.com"
                  className="text-primary hover:underline"
                >
                  support@noofox.com
                </a>
                <p className="mt-2 text-sm text-muted-foreground">
                  For general inquiries and support
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5 text-primary" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">Within 24 hours</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We aim to respond to all inquiries within one business day
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Topics We Can Help With
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Order status and tracking</li>
                  <li>Payment issues</li>
                  <li>Product questions</li>
                  <li>Shipping inquiries</li>
                  <li>Refunds and reshipments</li>
                  <li>General feedback</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Your name"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="you@example.com"
                        required
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Subject</FieldLabel>
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="What can we help you with?"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Message</FieldLabel>
                    <Textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      required
                    />
                  </Field>
                </FieldGroup>
                <Button type="submit" className="mt-6 w-full">
                  Send Message
                </Button>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  By submitting this form, you agree to our{" "}
                  <Link href="/privacy" className="underline hover:text-primary">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Link */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">Looking for Quick Answers?</h2>
          <p className="mt-2 text-muted-foreground">
            Check out our FAQ page for answers to common questions.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/faq">View FAQ</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
