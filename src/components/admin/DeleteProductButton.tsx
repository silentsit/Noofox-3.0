'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${productName}"?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {deleting ? 'Deleting…' : 'Delete'}
    </button>
  );
}
