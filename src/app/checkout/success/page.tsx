import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-surface-900">Order placed</h1>
      <p className="mt-2 text-surface-600">
        Your order has been received. Complete payment via the crypto gateway when
        the integration is connected.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700"
      >
        View dashboard
      </Link>
    </div>
  );
}
