'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type CampaignConfig = {
  id: string;
  display_mode: string;
  message_template: string;
  link_url: string | null;
  delay_ms: number;
  min_interval_ms: number;
  max_interval_ms: number;
  page_include: string[];
  page_exclude: string[];
  evergreen_pool: unknown;
};

function pathMatches(pathname: string, patterns: string[]): boolean {
  if (!patterns.length) return true;
  return patterns.some((p) => {
    const normalized = p.startsWith('/') ? p : `/${p}`;
    return pathname === normalized || pathname.startsWith(`${normalized}/`);
  });
}

export function SocialProofToaster() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const res = await fetch('/api/social-proof/config', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      const campaign = data.campaign as CampaignConfig | null;
      if (cancelled || !campaign?.id) return;

      const include = campaign.page_include ?? [];
      const exclude = campaign.page_exclude ?? [];
      if (include.length && !pathMatches(pathname, include)) return;
      if (exclude.length && pathMatches(pathname, exclude)) return;

      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }

      const es = new EventSource(`/api/social-proof/stream?campaign=${encodeURIComponent(campaign.id)}`);
      esRef.current = es;

      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data) as { type?: string; message?: string; linkUrl?: string | null };
          if (payload.type === 'toast' && payload.message) {
            setMessage(payload.message);
            setLinkUrl(payload.linkUrl ?? campaign.link_url ?? null);
            setVisible(true);
            window.setTimeout(() => setVisible(false), Math.min(12000, Math.max(4000, campaign.delay_ms || 6000)));
          }
        } catch {
          // ignore
        }
      };

      es.onerror = () => {
        es.close();
      };
    }

    void boot();

    return () => {
      cancelled = true;
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [pathname]);

  if (!visible || !message) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-4 z-[90] max-w-sm md:left-8"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-primary/15" aria-hidden />
        <div className="min-w-0 flex-1 text-sm text-foreground">
          {linkUrl ? (
            <Link href={linkUrl} className="font-medium hover:underline" onClick={dismiss}>
              {message}
            </Link>
          ) : (
            <span className="font-medium">{message}</span>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
