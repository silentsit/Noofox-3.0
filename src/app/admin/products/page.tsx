import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { DeleteProductButton } from '@/components/admin/DeleteProductButton';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">Product CRM</h1>
          <p className="mt-1 text-surface-600">
            Create, edit, and delete products.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700"
        >
          Add product
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200">
            <thead className="bg-surface-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Stock
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 bg-white">
              {(products ?? []).map((product) => {
                const img = product.images?.[0];
                return (
                  <tr key={product.id} className="hover:bg-surface-50">
                    <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-surface-100">
                        {img && (img.startsWith('http') || img.startsWith('/')) ? (
                          <Image
                            src={img}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized={img.startsWith('http')}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-surface-400 text-xs">
                            —
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-surface-900 sm:px-6">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-surface-600 sm:px-6">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-surface-600 sm:px-6">
                      {product.stock_count}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm sm:px-6">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </Link>
                      {' · '}
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {(!products || products.length === 0) && (
          <div className="px-6 py-12 text-center text-surface-600">
            No products. <Link href="/admin/products/new" className="text-primary-600 hover:text-primary-700">Add one</Link>.
          </div>
        )}
      </div>
    </div>
  );
}

