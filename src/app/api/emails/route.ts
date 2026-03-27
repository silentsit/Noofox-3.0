import { NextResponse } from 'next/server';
import type { EmailPayload } from '@/lib/email';
import { dispatchQueuedEmails, queueEmailEvent } from '@/lib/emailAutomation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { event, payload } = body as { event?: string; payload?: EmailPayload };

  if (!event || !payload) {
    return NextResponse.json({ error: 'event and payload required' }, { status: 400 });
  }

  const queued = await queueEmailEvent(event, payload);
  if (queued.length === 0) {
    return NextResponse.json({ error: `No active automation configured for event: ${event}` }, { status: 400 });
  }

  const dispatch = await dispatchQueuedEmails(25);
  return NextResponse.json({
    ok: true,
    queued: queued.length,
    dispatched: dispatch.sent,
    failed: dispatch.failed,
  });
}
