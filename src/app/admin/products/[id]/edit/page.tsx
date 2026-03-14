import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        ← Products
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-surface-900">Edit product</h1>
      <p className="mt-1 text-surface-500">{product.name}</p>
      <ProductForm className="mt-8 max-w-2xl" product={product} />
    </div>
  );
}
