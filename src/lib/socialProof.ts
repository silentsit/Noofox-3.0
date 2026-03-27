import { createServiceClient } from '@/lib/supabase/server';

export type SocialToastPayload = {
  message: string;
  linkUrl?: string | null;
};

export type EvergreenEntry = { city: string; product: string; url?: string };

export function renderSocialTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => vars[k] ?? '');
}

export async function sampleLiveSocialProof(): Promise<EvergreenEntry | null> {
  const service = createServiceClient();
  if (!service) return null;

  const { data } = await service
    .from('orders')
    .select('items, shipping_address, status, created_at')
    .order('created_at', { ascending: false })
    .limit(40);

  const rows = data ?? [];
  if (rows.length === 0) return null;

  const row = rows[Math.floor(Math.random() * rows.length)] as {
    items?: unknown;
    shipping_address?: unknown;
  };

  const items = row.items as Array<{ name?: string }> | undefined;
  const firstName =
    Array.isArray(items) && items.length > 0 && typeof items[0]?.name === 'string'
      ? items[0].name
      : 'an order';

  const ship = row.shipping_address as Record<string, unknown> | null;
  const city =
    (ship && typeof ship.city === 'string' && ship.city.trim()) ||
    (ship && typeof ship.state === 'string' && ship.state.trim()) ||
    'United States';

  return { city, product: firstName, url: '/shop' };
}

export function randomEvergreen(
  pool: unknown
): EvergreenEntry | null {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  const entry = pool[Math.floor(Math.random() * pool.length)] as Record<string, unknown>;
  const city = typeof entry.city === 'string' ? entry.city : 'United States';
  const product = typeof entry.product === 'string' ? entry.product : 'GrabModa';
  const url = typeof entry.url === 'string' ? entry.url : undefined;
  return { city, product, url };
}

export function randomBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
