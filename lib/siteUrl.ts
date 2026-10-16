import 'server-only';
import { headers } from 'next/headers';

/** A tidy origin ("https://jkaaf.com") from whatever was typed in the setting; null when it is not a usable web address. */
function origin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.origin : null;
  } catch {
    return null;
  }
}

/** The address the visitor used for this request ("https://jkaaf.com", "http://localhost:3000"), or null outside a request. */
async function requestOrigin(): Promise<string | null> {
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (!host) return null;
    const proto = h.get('x-forwarded-proto') ?? (/^(localhost|127\.|\[::1\])/.test(host) ? 'http' : 'https');
    return `${proto}://${host}`;
  } catch {
    return null;
  }
}

/**
 * The public address of the site, for links in emails and payment return pages. Works everywhere without changes:
 *  - on your computer (`npm run dev`): the address you are browsing, e.g. http://localhost:3000
 *  - live: SITE_URL (set it to https://jkaaf.com on Vercel; NEXT_PUBLIC_SITE_URL also works); if that is missing, Vercel's own production
 *    domain, and as a last resort the address of the current request.
 * Live sites deliberately prefer the fixed setting over the request's Host header, so nobody can make the site
 * email out links that point to another domain.
 */
export async function siteUrl(): Promise<string> {
  if (process.env.NODE_ENV !== 'production') {
    const here = await requestOrigin();
    if (here) return here;
  }
  // A Vercel preview deployment (a test copy) links to itself, not to the live site.
  if (process.env.VERCEL_ENV === 'preview') {
    const preview = origin(process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`);
    if (preview) return preview;
  }
  // SITE_URL is read when the site runs; NEXT_PUBLIC_SITE_URL is the older name (it is baked in when the site is built).
  const configured = origin(process.env.SITE_URL) ?? origin(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;
  // No domain of your own yet: Vercel's free address (your-project.vercel.app) is filled in automatically.
  const vercel = origin(process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  if (vercel) return vercel;
  return (await requestOrigin()) ?? 'http://localhost:3000';
}
