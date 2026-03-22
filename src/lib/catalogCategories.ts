import type { CatalogProduct } from '@/types/catalog';

export type CatalogSilo = 'modafinil' | 'armodafinil' | 'combo';

/**
 * Classify catalog products into silos. Top-level `category` is often null in JSON;
 * slug patterns match imported catalog product naming (legacy URL slugs).
 */
export function classifyCatalogProduct(product: CatalogProduct): CatalogSilo {
  const slug = product.slug.toLowerCase();
  const cat = (product.category ?? '').toLowerCase();

  if (cat.includes('combo') || cat.includes('nootropic combos')) return 'combo';
  if (slug.includes('starter-pack') || slug.includes('upsize-combo')) return 'combo';

  if (
    slug.includes('waklert') ||
    slug.includes('artvigil') ||
    slug.includes('armodaxl')
  ) {
    return 'armodafinil';
  }

  return 'modafinil';
}

export function getProductsBySilo(
  products: CatalogProduct[],
  silo: CatalogSilo
): CatalogProduct[] {
  return products.filter((p) => classifyCatalogProduct(p) === silo);
}
