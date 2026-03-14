export const metadata = {
  title: 'Shipping | Noofox',
  description: 'Shipping information for Noofox orders.',
};

export default function ShippingPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-surface-900">Shipping</h1>
        <p className="mt-6 text-surface-600 leading-relaxed">
          All orders include free worldwide shipping. Orders are typically processed
          within 24-48 hours and delivered in 7-14 business days depending on your location.
        </p>
        <p className="mt-4 text-surface-600 leading-relaxed">
          Tracking details are available in your dashboard after your order is placed.
          All packages are shipped in plain, unmarked packaging for complete discretion.
        </p>
      </div>
    </div>
  );
}
