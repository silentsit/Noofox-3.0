import { NextResponse } from 'next/server';
import {
  randomBetween,
  randomEvergreen,
  renderSocialTemplate,
  sampleLiveSocialProof,
} from '@/lib/socialProof';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Server-Sent Events stream for social-proof toasts.
 * Uses service role to sample recent orders (no PII in payload — city + product only).
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaign');

  const service = createServiceClient();
  let displayMode = 'mixed';
  let template = '{{city}} · {{product}}';
  let minMs = 15000;
  let maxMs = 40000;
  let evergreenPool: unknown = [];

  if (service && campaignId) {
    const { data } = await service
      .from('social_proof_campaigns')
      .select('display_mode, message_template, min_interval_ms, max_interval_ms, evergreen_pool, is_active')
      .eq('id', campaignId)
      .eq('is_active', true)
      .maybeSingle();
    if (data) {
      displayMode = String(data.display_mode ?? 'mixed');
      template = String(data.message_template ?? template);
      minMs = Number(data.min_interval_ms) || minMs;
      maxMs = Number(data.max_interval_ms) || maxMs;
      evergreenPool = data.evergreen_pool ?? [];
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      send({ type: 'ping' });

      const tick = async () => {
        try {
          let city = 'United States';
          let product = 'Modalert';
          let url: string | undefined;

          if (displayMode === 'evergreen') {
            const eg = randomEvergreen(evergreenPool);
            if (eg) {
              city = eg.city;
              product = eg.product;
              url = eg.url;
            }
          } else if (displayMode === 'live') {
            const live = await sampleLiveSocialProof();
            if (live) {
              city = live.city;
              product = live.product;
              url = live.url;
            }
          } else {
            const useLive = Math.random() > 0.45;
            if (useLive) {
              const live = await sampleLiveSocialProof();
              if (live) {
                city = live.city;
                product = live.product;
                url = live.url;
              } else {
                const eg = randomEvergreen(evergreenPool);
                if (eg) {
                  city = eg.city;
                  product = eg.product;
                  url = eg.url;
                }
              }
            } else {
              const eg = randomEvergreen(evergreenPool);
              if (eg) {
                city = eg.city;
                product = eg.product;
                url = eg.url;
              } else {
                const live = await sampleLiveSocialProof();
                if (live) {
                  city = live.city;
                  product = live.product;
                  url = live.url;
                }
              }
            }
          }

          const message = renderSocialTemplate(template, { city, product });
          send({ type: 'toast', message, linkUrl: url ?? null });
        } catch {
          send({ type: 'error', message: 'tick_failed' });
        }

        const wait = randomBetween(minMs, maxMs);
        setTimeout(tick, wait);
      };

      const firstWait = randomBetween(2000, 8000);
      setTimeout(tick, firstWait);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
