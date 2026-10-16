// Contact details printed in emails and invoices. No server-only imports, so email templates can use it anywhere.

export const CONTACT_PHONE = '(504) 835-6825';
export const CONTACT_PHONE_LINK = '+15048356825';

/** The address customers can write to: EMAIL_REPLY_TO, else the sender address in EMAIL_FROM. Empty when neither is set. */
export function contactEmail(): string {
  const v = (process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || '').trim();
  const inBrackets = v.match(/<([^>]+)>/);
  return (inBrackets ? inBrackets[1] : v).trim();
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
