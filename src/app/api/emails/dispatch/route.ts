import { NextResponse } from 'next/server';
import { dispatchQueuedEmails, queueDueAbandonedCartEmails } from '@/lib/emailAutomation';
import { requireAdminRoute } from '@/lib/rbac';

export async function POST(request: Request) {
  const secret = request.headers.get('x-email-dispatch-secret');
  const bearer = request.headers.get('authorization') ?? '';
  const bearerToken = bearer.toLowerCase().startsWith('bearer ')
    ? bearer.slice(7).trim()
    : '';
  const expected = process.env.EMAIL_DISPATCH_SECRET?.trim();
  const cronSecret = process.env.CRON_SECRET?.trim();
  const isAuthorizedBySecret =
    !!expected && (secret === expected || bearerToken === expected);
  const isAuthorizedByCron =
    !!cronSecret && bearerToken === cronSecret;

  if (!isAuthorizedBySecret && !isAuthorizedByCron) {
    const auth = await requireAdminRoute({ action: 'write', resource: 'email' });
    if (auth.response) return auth.response;
  }

  const queued = await queueDueAbandonedCartEmails(50);
  const dispatched = await dispatchQueuedEmails(50);
  return NextResponse.json({ ok: true, queued, dispatched });
}

