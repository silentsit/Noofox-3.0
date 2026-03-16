/**
 * Resolve product image URL. Uses NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN (e.g. https://noofoxxx.local)
 * so images can be served from that site. Relative paths are prefixed with the origin.
 */
const PRODUCT_IMAGE_ORIGIN =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN
    ? process.env.NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN.replace(/\/$/, '')
    : 'https://noofoxxx.local';

export function getProductImageUrl(
  images: string[] | null | undefined,
  index: number = 0
): string {
  const raw = images?.[index];
  if (raw && (raw.startsWith('http://') || raw.startsWith('https://'))) {
    return raw;
  }
  if (raw && raw.startsWith('/')) {
    return `${PRODUCT_IMAGE_ORIGIN}${raw}`;
  }
  if (raw) {
    return `${PRODUCT_IMAGE_ORIGIN}/${raw.replace(/^\//, '')}`;
  }
  return `${PRODUCT_IMAGE_ORIGIN}/placeholder-product.jpg`;
}

/** Catalog product image: use first from product.images or null (no external origin). */
export function getCatalogProductImageUrl(
  product: { images?: string[] } | null | undefined,
  index: number = 0
): string | null {
  const raw = product?.images?.[index];
  if (raw && (raw.startsWith('http://') || raw.startsWith('https://'))) {
    return raw;
  }
  if (raw) return raw;
  return null;
}
