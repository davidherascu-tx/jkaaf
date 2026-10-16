// Contact details printed in emails and invoices. No server-only imports, so email templates can use it anywhere.

export const CONTACT_PHONE = '(504) 835-6825';
export const CONTACT_PHONE_LINK = '+15048356825';

const EMAIL_IN_TEXT = /[^\s<>"',;]+@[^\s<>"',;]+\.[^\s<>"',;]+/;

/**
 * Turns the EMAIL_FROM setting into a sender: {name, address}. Accepts the proper form ("JKA/AF <jkaaf@jkaaf.com>")
 * and also forgives common slips, such as the angle brackets getting lost on the way in ("JKA/AF jkaaf@jkaaf.com"),
 * which would otherwise show up as "JKA/AF jkaaf"@jkaaf.com. A missing name becomes "JKA/AF".
 */
export function parseSender(raw: string | undefined): { name: string; address: string } | null {
  const text = (raw ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\\/g, '')
    .trim();
  const m = text.match(EMAIL_IN_TEXT);
  if (!m) return null;
  const name = text.replace(m[0], '').replace(/[<>"']/g, '').trim();
  return { name: name || 'JKA/AF', address: m[0] };
}

/** The address customers can write to: EMAIL_REPLY_TO, else the sender address in EMAIL_FROM. Empty when neither is set. */
export function contactEmail(): string {
  return parseSender(process.env.EMAIL_REPLY_TO)?.address ?? parseSender(process.env.EMAIL_FROM)?.address ?? '';
}

/** "jkaaf.com" for the footer: from the site settings, tidied up (a mistyped value such as "https://@jkaaf.com" still works). */
export function siteHost(): string {
  const candidates = [
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
  ];
  for (const c of candidates) {
    if (!c) continue;
    try {
      const u = new URL(c.trim());
      if (u.protocol === 'http:' || u.protocol === 'https:') return u.host;
    } catch {
      /* try the next one */
    }
  }
  return '';
}
