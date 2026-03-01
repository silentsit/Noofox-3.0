export const metadata = {
  title: 'Shipping | Noofox',
  description: 'Shipping information.',
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-surface-900">Shipping</h1>
      <p className="mt-4 text-surface-600">
        Shipping details and tracking are available in your dashboard after your
        order is placed.
      </p>
    </div>
  );
}
