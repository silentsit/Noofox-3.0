/**
 * Minimal HTML sanitizer for rich content (blog, product descriptions).
 * Strips script, iframe, object, form, and event handlers.
 */

const FORBIDDEN_TAGS = /<\/?(script|iframe|object|form|input|button|textarea)[^>]*>/gi;
const FORBIDDEN_ATTRS = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
const FORBIDDEN_ATTRS2 = /\s+on\w+\s*=\s*[^\s>]+/gi;

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(FORBIDDEN_TAGS, '')
    .replace(FORBIDDEN_ATTRS, '')
    .replace(FORBIDDEN_ATTRS2, '');
}
