export const metadata = {
  title: 'About | Noofox',
  description: 'About Noofox.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-surface-900">About</h1>
      <p className="mt-4 text-surface-600">
        Noofox is a modern e-commerce platform. Shop with instant checkout and pay
        with card or crypto.
      </p>
    </div>
  );
}
