export const metadata = {
  title: 'About | Noofox',
  description: 'About Noofox — premium nootropics and cognitive enhancers.',
};

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-surface-900">About Noofox</h1>
        <p className="mt-6 text-surface-600 leading-relaxed">
          Noofox is your trusted source for premium nootropics and cognitive enhancers.
          We deliver pharmaceutical-grade products worldwide with discreet shipping and
          accept all major cryptocurrencies alongside traditional payment methods.
        </p>
        <p className="mt-4 text-surface-600 leading-relaxed">
          Our mission is to make cognitive enhancement accessible, affordable, and
          hassle-free. Every product is sourced from licensed manufacturers with proper
          documentation and quality assurance.
        </p>
      </div>
    </div>
  );
}
