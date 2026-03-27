import type { OrderStatus } from '@/types/database';

export const ORDER_STATUSES: OrderStatus[] = [
  'Pending Payment',
  'Processing',
  'On Hold',
  'Completed',
  'Cancelled',
  'Refunded',
  'Failed',
];

export const ORDER_STATUS_TABS = [
  { label: 'All', value: 'All' },
  ...ORDER_STATUSES.map((status) => ({ label: status, value: status })),
] as const;

export const REVERSE_STOCK_STATUSES: OrderStatus[] = ['Cancelled', 'Refunded', 'Failed'];

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

export function getOrderStatusClasses(status: string) {
  switch (status) {
    case 'Completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Processing':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'On Hold':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'Cancelled':
    case 'Failed':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'Refunded':
      return 'border-purple-200 bg-purple-50 text-purple-700';
    default:
      return 'border-surface-200 bg-surface-50 text-surface-700';
  }
}

export function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatAddressSnippet(address: unknown) {
  if (!address || typeof address !== 'object') {
    return 'No address';
  }

  const candidate = address as Record<string, unknown>;
  const parts = [
    candidate.line1,
    candidate.city,
    candidate.state,
    candidate.postal_code,
    candidate.country,
  ]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : 'No address';
}

export function toDisplayItems(items: unknown) {
  return Array.isArray(items) ? items : [];
}
