'use client';

import { Turnstile } from '@marsidev/react-turnstile';

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';

type Props = {
  onToken: (token: string | null) => void;
  className?: string;
};

/**
 * Turnstile widget. When site key is unset, server skips verification (local dev).
 */
export function TurnstileField({ onToken, className }: Props) {
  if (!siteKey) {
    return null;
  }

  return (
    <div className={className}>
      <Turnstile
        siteKey={siteKey}
        options={{ size: 'flexible' }}
        onSuccess={(token) => onToken(token)}
        onExpire={() => onToken(null)}
        onError={() => onToken(null)}
      />
    </div>
  );
}

export function hasTurnstileSiteKey(): boolean {
  return Boolean(siteKey);
}
