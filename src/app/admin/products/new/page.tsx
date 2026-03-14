import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-surface-900">New product</h1>
      <p className="mt-1 text-surface-500">Add a new product to the store.</p>
      <ProductForm className="mt-8 max-w-2xl" />
    </div>
  );
}
