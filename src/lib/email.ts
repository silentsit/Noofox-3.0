/**
 * Helpers for sending transactional emails. Admin recipients from env or DB.
 */

import { createClient, createServiceClient } from '@/lib/supabase/server';

export type EmailPayload = {
  order_id?: string;
  customer_email?: string;
  tracking_id?: string;
  status?: string;
  previous_status?: string;
  total_amount?: number;
  items?: unknown[];
  shipping_address?: unknown;
  [key: string]: unknown;
};

/**
 * Resolve admin email addresses: ADMIN_EMAIL env (comma-separated) or users with role 'admin'.
 * Uses service-role client when available so it works from API routes without user cookies.
 */
export async function getAdminEmails(): Promise<string[]> {
  const fromEnv = process.env.ADMIN_EMAIL;
  if (fromEnv && typeof fromEnv === 'string') {
    return fromEnv.split(',').map((e) => e.trim()).filter(Boolean);
  }
  const service = createServiceClient();
  const supabase = service ?? await createClient();
  const { data: legacyRows } = await supabase
    .from('users')
    .select('email')
    .eq('role', 'admin');
  const emails = new Set<string>();
  for (const row of legacyRows ?? []) {
    if (row.email) emails.add(row.email);
  }

  const { data: assignedRows } = await supabase
    .from('user_admin_roles')
    .select('user_id');
  const assignedIds = (assignedRows ?? []).map((r) => r.user_id).filter(Boolean);
  if (assignedIds.length > 0) {
    const { data: assignedUsers } = await supabase
      .from('users')
      .select('email')
      .in('id', assignedIds);
    for (const row of assignedUsers ?? []) {
      if (row.email) emails.add(row.email);
    }
  }

  return Array.from(emails);
}

/**
 * Call the app's email API (for use from API routes or server actions).
 * Use NEXT_PUBLIC_SITE_URL in server actions; in API routes pass baseUrl from request.
 */
export async function triggerEmail(
  baseUrl: string,
  event: string,
  payload: EmailPayload
): Promise<{ ok: boolean; sent?: boolean; error?: string }> {
  try {
    const res = await fetch(`${baseUrl}/api/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (data as { error?: string }).error ?? res.statusText };
    }
    return { ok: true, sent: (data as { sent?: boolean }).sent };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
