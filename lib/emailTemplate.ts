// Shared look for every email the shop sends: logo header, white card, footer.
// The logo is attached inline by sendMail (cid:logo), so it shows even when the site is not public yet.

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const RED = '#d4281c';
export const INK = '#111827';
export const MUTED = '#6b7280';
export const LINE = '#e5e7eb';

/** Wraps content in the branded email layout. `body` is trusted HTML. */
export function emailLayout(opts: { title: string; preheader?: string; body: string }): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#f4f3ef;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:${INK}">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3ef"><tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px">
    <tr><td style="background:#ffffff;border-radius:16px 16px 0 0;border-top:6px solid ${RED};padding:26px 32px 18px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="64" valign="middle"><img src="cid:logo" width="56" height="56" alt="JKA/AF" style="display:block;border:0"></td>
        <td valign="middle" style="padding-left:14px">
          <div style="font-size:20px;font-weight:800;letter-spacing:.5px;color:${INK}">日本空手協会</div>
          <div style="font-size:13px;font-weight:700;letter-spacing:1px;color:${RED}">JKA/AF</div>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#ffffff;padding:8px 32px 32px;font-size:15px;line-height:1.6">
      <h1 style="margin:8px 0 16px;font-size:24px;line-height:1.25;font-weight:800;color:${INK}">${escapeHtml(opts.title)}</h1>
      ${opts.body}
    </td></tr>
    <tr><td style="background:#111827;border-radius:0 0 16px 16px;padding:22px 32px;text-align:center;color:#d1d5db;font-size:12px;line-height:1.7">
      <div style="font-weight:700;color:#ffffff;font-size:13px">Japan Karate Association / American Federation</div>
      <div>JKAAFUSA@gmail.com &nbsp;·&nbsp; (504) 835-6825</div>
      ${site ? `<div><a href="${escapeHtml(site)}" style="color:#fca5a5;text-decoration:none">${escapeHtml(site.replace(/^https?:\/\//, ''))}</a></div>` : ''}
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

/** A call-to-action button (trusted href). */
export const emailButton = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:${RED};color:#ffffff;text-decoration:none;font-weight:700;padding:12px 26px;border-radius:999px">${escapeHtml(label)}</a></p>`;

/** A highlighted note box. `html` is trusted. */
export const emailNote = (html: string, tone: 'amber' | 'green' = 'amber') => {
  const c = tone === 'green' ? { bg: '#ecfdf5', bd: '#a7f3d0' } : { bg: '#fffbeb', bd: '#fde68a' };
  return `<div style="background:${c.bg};border:1px solid ${c.bd};border-radius:12px;padding:16px 18px;margin:20px 0;font-size:14px;line-height:1.6">${html}</div>`;
};

const linkify = (escaped: string) =>
  escaped.replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}" style="color:${RED};word-break:break-all">${u}</a>`);

/** Short notification email: heading plus paragraphs (plain text in, links made clickable). */
export function simpleEmail(title: string, paragraphs: string[]): { html: string; text: string } {
  const body = paragraphs.map((p) => `<p style="margin:0 0 14px">${linkify(escapeHtml(p))}</p>`).join('');
  return { html: emailLayout({ title, preheader: paragraphs[0], body }), text: [title, '', ...paragraphs].join('\n') };
}
