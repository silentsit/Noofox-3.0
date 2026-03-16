'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept Bitcoin, Ethereum, USDT, USDC, and card payments via our payment partner. No KYC required for purchases under $700.',
  },
  {
    question: 'How does the USD on-ramp work?',
    answer:
      'Don\'t own cryptocurrency? Use our integrated USD on-ramp to purchase crypto with your credit card, debit card, or bank transfer. Complete your purchase in minutes.',
  },
  {
    question: 'Is shipping really free?',
    answer:
      'Yes! We offer free shipping on all orders worldwide. No minimums, no hidden fees.',
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Orders are typically shipped within 24-48 hours. Delivery takes 7-14 business days depending on your location. Tracking is provided for every order.',
  },
  {
    question: 'Are your products genuine?',
    answer:
      'Absolutely. All our products are sourced directly from licensed manufacturers and come with proper documentation and batch numbers.',
  },
  {
    question: 'Is my order discreet?',
    answer:
      'Yes. All orders are shipped in plain, unmarked packaging with no indication of the contents. Your privacy is our priority.',
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-xl border border-surface-200 bg-white overflow-hidden transition-shadow hover:shadow-sm"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex min-h-[48px] w-full items-center justify-between px-4 py-4 text-left font-medium text-surface-900 hover:text-brand-600 transition-colors sm:px-6 sm:py-5 touch-manipulation"
            aria-expanded={openIndex === i}
          >
            {faq.question}
            <ChevronDown
              className={`ml-3 h-5 w-5 shrink-0 text-surface-400 transition-transform duration-200 ${
                openIndex === i ? 'rotate-180 text-brand-600' : ''
              }`}
              aria-hidden
            />
          </button>
          {openIndex === i && (
            <div className="border-t border-surface-100 px-6 py-5 text-sm leading-relaxed text-surface-600 bg-surface-50">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
