import { createClient } from '@/lib/supabase/server';

export type AuditLogInput = {
  action: string;
  resourceType: string;
  resourceId?: string | null;
  oldData?: unknown;
  newData?: unknown;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
};

export type OrderTimelineInput = {
  orderId: string;
  message: string;
  entryType?: 'system' | 'note';
  isPrivate?: boolean;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(input: AuditLogInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId ?? null,
    old_data: input.oldData ?? null,
    new_data: input.newData ?? null,
    ip_address: input.ipAddress ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function appendOrderTimeline(input: OrderTimelineInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.rpc('append_order_timeline', {
    p_order_id: input.orderId,
    p_entry_type: input.entryType ?? 'system',
    p_message: input.message,
    p_is_private: input.isPrivate ?? false,
    p_actor_id: user?.id ?? null,
    p_metadata: input.metadata ?? {},
  });
}
