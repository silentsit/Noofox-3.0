/**
 * Cloudflare Turnstile server-side verification.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function isTurnstileEnforced(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteip?: string | null
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return true;
  }
  if (!token || typeof token !== 'string' || !token.trim()) {
    return false;
  }

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token.trim());
  if (remoteip) body.set('remoteip', remoteip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export function clientIpFromRequest(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return undefined;
}
