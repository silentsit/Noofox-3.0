import { NextResponse } from 'next/server';
import { dispatchQueuedEmails, queueDueAbandonedCartEmails } from '@/lib/emailAutomation';
import { requireAdminRoute } from '@/lib/rbac';

export async function POST() {
  const auth = await requireAdminRoute({ action: 'write', resource: 'email' });
  if (auth.response) return auth.response;

  const queued = await queueDueAbandonedCartEmails(50);
  const dispatched = await dispatchQueuedEmails(50);
  return NextResponse.json({ ok: true, queued, dispatched });
}

