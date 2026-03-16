import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getCatalogProductBySlug, getCatalogProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

function normalizeName(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const directMatch = await getCatalogProductBySlug(id);

  if (directMatch) {
    redirect(directMatch.urlPath);
  }

  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('name').eq('id', id).single();
  if (!product) notFound();

  const normalized = normalizeName(product.name);
  const products = await getCatalogProducts();
  const catalogMatch = products.find((entry) => {
    const candidate = normalizeName(entry.name);
    return candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate);
  });

  if (catalogMatch) {
    redirect(catalogMatch.urlPath);
  }

  redirect('/shop');
}
