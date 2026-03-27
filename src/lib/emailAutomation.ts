import { Resend } from 'resend';
import type {
  AbandonedCart,
  EmailAutomation,
  EmailBroadcast,
  EmailQueueJob,
  EmailSubscriber,
  EmailTemplate,
} from '@/types/database';
import type { Json } from '@/types/supabase';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getAdminEmails, type EmailPayload } from '@/lib/email';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM ?? 'GrabModa <onboarding@resend.dev>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com';

type DbClient = Awaited<ReturnType<typeof createClient>>;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapHtml(subject: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head><body style="font-family:sans-serif;line-height:1.6;color:#181c29;max-width:560px;margin:0 auto;padding:24px"><div>${bodyHtml}</div><p style="margin-top:24px;font-size:12px;color:#6b7280">GrabModa</p></body></html>`;
}

function getNestedValue(value: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return '';
  }, value);
}

function renderTemplate(template: string, payload: Record<string, unknown>) {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key) => {
    const raw = getNestedValue(payload, key);
    if (raw == null) return '';
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
    return JSON.stringify(raw);
  });
}

function formatUsd(value: unknown) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(amount) ? amount : 0);
}

function buildTemplatePayload(payload: EmailPayload): Record<string, unknown> {
  const orderId = typeof payload.order_id === 'string' ? payload.order_id : '';
  const couponCode = typeof payload.coupon_code === 'string' ? payload.coupon_code.trim() : '';
  return {
    ...payload,
    site_url: SITE_URL,
    order_short_id: orderId ? orderId.slice(0, 8).toUpperCase() : '',
    total_amount_formatted: formatUsd(payload.total_amount),
    subtotal_amount_formatted: formatUsd(payload.subtotal_amount),
    coupon_message: couponCode ? `Use coupon code ${couponCode} when you come back.` : '',
    review_url: `${SITE_URL}/contact`,
  };
}

async function getDb(): Promise<DbClient> {
  const service = createServiceClient();
  return (service ?? (await createClient())) as DbClient;
}

async function sendEmailMessage(input: {
  to: string;
  subject: string;
  htmlBody?: string | null;
  textBody?: string | null;
}) {
  if (!resendApiKey) {
    console.warn('[emails] RESEND_API_KEY not set; skipping send', {
      to: input.to.slice(0, 20) + '…',
      subject: input.subject,
    });
    return false;
  }

  try {
    const resend = new Resend(resendApiKey);
    const html = wrapHtml(input.subject, input.htmlBody || `<p>${escapeHtml(input.textBody || '')}</p>`);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [input.to],
      subject: input.subject,
      html,
      text: input.textBody ?? undefined,
    });
    if (error) {
      console.error('[emails] Resend error', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[emails] send failed', err);
    return false;
  }
}

async function getAutomationsForEvent(eventKey: string) {
  const db = await getDb();
  const { data } = await db
    .from('email_automations')
    .select('*')
    .eq('event_key', eventKey)
    .eq('enabled', true);
  return (data ?? []) as EmailAutomation[];
}

async function getTemplateByKey(key: string) {
  const db = await getDb();
  const { data } = await db.from('email_templates').select('*').eq('key', key).single();
  return data as EmailTemplate | null;
}

async function resolveRecipients(
  automation: Pick<EmailAutomation, 'audience'>,
  payload: EmailPayload
): Promise<Array<{ email: string; userId?: string | null }>> {
  if (automation.audience === 'admin' || automation.audience === 'internal') {
    const admins = await getAdminEmails();
    return admins.map((email) => ({ email }));
  }

  const email =
    (typeof payload.recipient_email === 'string' && payload.recipient_email.trim()) ||
    (typeof payload.customer_email === 'string' && payload.customer_email.trim()) ||
    '';
  if (!email) return [];
  const userId = typeof payload.user_id === 'string' ? payload.user_id : null;
  return [{ email, userId }];
}

export async function queueEmailEvent(eventKey: string, payload: EmailPayload) {
  const automations = await getAutomationsForEvent(eventKey);
  const db = await getDb();
  const queuedIds: string[] = [];

  for (const automation of automations) {
    const template = await getTemplateByKey(automation.template_key);
    if (!template || !template.is_active) continue;

    const templatePayload = buildTemplatePayload(payload);
    const recipients = await resolveRecipients(automation, payload);
    if (recipients.length === 0) continue;

    const sendAfter = new Date(Date.now() + automation.delay_minutes * 60_000).toISOString();
    const queueRows = recipients.map((recipient) => ({
      automation_key: automation.key,
      template_key: template.key,
      event_key: eventKey,
      recipient_email: recipient.email,
      recipient_user_id: recipient.userId ?? null,
      subject: renderTemplate(template.subject_template, templatePayload),
      html_body: renderTemplate(template.html_template, templatePayload),
      text_body: renderTemplate(template.text_template, templatePayload),
      payload: templatePayload as Json,
      metadata: {
        audience: automation.audience,
      } as Json,
      send_after: sendAfter,
      status: 'pending' as const,
    }));

    const { data } = await db.from('email_queue').insert(queueRows).select('id');
    for (const row of data ?? []) queuedIds.push(row.id);
  }

  // Welcome series fan-out: queue day-2 and day-7 follow-up events once.
  if (eventKey === 'welcome_email' && queuedIds.length > 0) {
    const secondWavePayload = {
      ...payload,
      _welcome_series_origin: 'welcome_email',
    };
    const day2 = await queueEmailEvent('welcome_series_day_2', secondWavePayload);
    const day7 = await queueEmailEvent('welcome_series_day_7', secondWavePayload);
    queuedIds.push(...day2, ...day7);
  }

  return queuedIds;
}

export async function dispatchQueuedEmails(limit = 25) {
  const db = await getDb();
  const now = new Date().toISOString();
  const { data } = await db
    .from('email_queue')
    .select('*')
    .in('status', ['pending', 'failed'])
    .lte('send_after', now)
    .order('send_after', { ascending: true })
    .limit(limit);

  const jobs = (data ?? []) as EmailQueueJob[];
  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    await db
      .from('email_queue')
      .update({
        status: 'processing',
        attempts: job.attempts + 1,
        last_error: null,
      })
      .eq('id', job.id);

    const ok = await sendEmailMessage({
      to: job.recipient_email,
      subject: job.subject ?? 'GrabModa',
      htmlBody: job.html_body,
      textBody: job.text_body,
    });

    if (ok) {
      sent += 1;
      await db
        .from('email_queue')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          failed_at: null,
        })
        .eq('id', job.id);

      const metadata = (job.metadata ?? {}) as Record<string, unknown>;
      const broadcastId =
        typeof metadata.broadcast_id === 'string' ? metadata.broadcast_id : null;
      if (broadcastId) {
        const { data: broadcast } = await db
          .from('email_broadcasts')
          .select('sent_count')
          .eq('id', broadcastId)
          .single();
        if (broadcast) {
          await db
            .from('email_broadcasts')
            .update({ sent_count: (broadcast.sent_count ?? 0) + 1 })
            .eq('id', broadcastId);
        }
      }

      if (job.event_key === 'broadcast' || job.event_key === 'abandoned_cart') {
        await db
          .from('email_subscribers')
          .update({ last_marketing_email_at: new Date().toISOString() })
          .eq('email', job.recipient_email);
      }
    } else {
      failed += 1;
      await db
        .from('email_queue')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          last_error: 'Resend send failed',
        })
        .eq('id', job.id);
    }
  }

  return { processed: jobs.length, sent, failed };
}

export async function upsertEmailSubscriber(input: {
  email: string;
  userId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  source?: string;
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  const email = input.email.trim().toLowerCase();
  if (!email) return null;

  const { data } = await db
    .from('email_subscribers')
    .upsert(
      {
        email,
        user_id: input.userId ?? null,
        first_name: input.firstName ?? null,
        last_name: input.lastName ?? null,
        source: input.source ?? 'checkout',
        status: 'subscribed',
        metadata: (input.metadata ?? {}) as Json,
      },
      { onConflict: 'email' }
    )
    .select('*')
    .single();

  return data as EmailSubscriber | null;
}

export async function upsertAbandonedCart(input: {
  email: string;
  userId?: string | null;
  items: unknown[];
  subtotalAmount: number;
  couponCode?: string | null;
  paymentChoice?: string | null;
  marketingOptIn?: boolean;
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  const email = input.email.trim().toLowerCase();
  if (!email) return null;

  const { data } = await db
    .from('abandoned_carts')
    .upsert(
      {
        customer_email: email,
        user_id: input.userId ?? null,
        items: (Array.isArray(input.items) ? input.items : []) as Json,
        subtotal_amount: Number(input.subtotalAmount || 0),
        coupon_code: input.couponCode ?? null,
        payment_choice: input.paymentChoice ?? null,
        marketing_opt_in: !!input.marketingOptIn,
        metadata: (input.metadata ?? {}) as Json,
        recovered_at: null,
        last_activity_at: new Date().toISOString(),
      },
      { onConflict: 'customer_email' }
    )
    .select('*')
    .single();

  return data as AbandonedCart | null;
}

export async function markAbandonedCartRecovered(email: string) {
  const db = await getDb();
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return;
  await db
    .from('abandoned_carts')
    .update({ recovered_at: new Date().toISOString() })
    .eq('customer_email', trimmed);
}

export async function queueDueAbandonedCartEmails(limit = 20) {
  const db = await getDb();
  const automation = (await getAutomationsForEvent('abandoned_cart')).find((a) => a.enabled);
  if (!automation) return { queued: 0 };

  const cutoff = new Date(Date.now() - automation.delay_minutes * 60_000).toISOString();
  const { data } = await db
    .from('abandoned_carts')
    .select('*')
    .is('recovered_at', null)
    .lte('last_activity_at', cutoff)
    .order('last_activity_at', { ascending: true })
    .limit(limit);

  const carts = (data ?? []) as AbandonedCart[];
  let queued = 0;

  for (const cart of carts) {
    if (cart.last_email_sent_at && cart.last_email_sent_at >= cart.last_activity_at) {
      continue;
    }
    if (!cart.customer_email || !cart.marketing_opt_in) continue;

    const ids = await queueEmailEvent('abandoned_cart', {
      customer_email: cart.customer_email,
      user_id: cart.user_id ?? undefined,
      subtotal_amount: cart.subtotal_amount,
      coupon_code: cart.coupon_code ?? undefined,
      items: Array.isArray(cart.items) ? (cart.items as unknown[]) : [],
    });
    if (ids.length > 0) {
      queued += ids.length;
      await db
        .from('abandoned_carts')
        .update({ last_email_sent_at: new Date().toISOString() })
        .eq('id', cart.id);
    }
  }

  return { queued };
}

async function getRecipientsForSegment(segmentKey: string) {
  const db = await getDb();
  if (segmentKey === 'admins') {
    const admins = await getAdminEmails();
    return admins.map((email) => ({ email }));
  }
  if (segmentKey === 'customers') {
    const { data } = await db.from('users').select('email').eq('role', 'customer');
    return (data ?? []).filter((x) => x.email).map((x) => ({ email: x.email! }));
  }
  const { data } = await db
    .from('email_subscribers')
    .select('email')
    .eq('status', 'subscribed');
  return (data ?? []).map((x) => ({ email: x.email }));
}

export async function createBroadcastAndQueue(input: {
  name: string;
  segmentKey: string;
  couponCode?: string | null;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate: string;
  createdBy?: string | null;
}) {
  const db = await getDb();
  const { data: broadcast } = await db
    .from('email_broadcasts')
    .insert({
      name: input.name,
      segment_key: input.segmentKey,
      coupon_code: input.couponCode ?? null,
      subject_template: input.subjectTemplate,
      html_template: input.htmlTemplate,
      text_template: input.textTemplate,
      created_by: input.createdBy ?? null,
      status: 'queued',
    })
    .select('*')
    .single();

  const recipients = await getRecipientsForSegment(input.segmentKey);
  const payload = buildTemplatePayload({ coupon_code: input.couponCode ?? undefined });
  const rows = recipients.map((recipient) => ({
    event_key: 'broadcast',
    recipient_email: recipient.email,
    subject: renderTemplate(input.subjectTemplate, payload),
    html_body: renderTemplate(input.htmlTemplate, payload),
    text_body: renderTemplate(input.textTemplate, payload),
    payload: payload as Json,
    metadata: { broadcast_id: broadcast?.id ?? null } as Json,
    send_after: new Date().toISOString(),
    status: 'pending' as const,
  }));

  if (rows.length > 0) {
    await db.from('email_queue').insert(rows);
  }

  return broadcast as EmailBroadcast | null;
}
