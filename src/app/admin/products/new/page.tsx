import { ProductForm } from '@/components/admin/ProductForm';
import { requireAdminPage } from '@/lib/rbac';

export default async function NewProductPage() {
  await requireAdminPage({ action: 'write', resource: 'products' });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-surface-900">New product</h1>
      <p className="mt-1 text-surface-500">Add a new product to the store.</p>
      <ProductForm className="mt-8 max-w-2xl" />
    </div>
  );
}
