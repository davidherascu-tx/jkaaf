import 'server-only';
import { siteUrl } from '@/lib/siteUrl';
import { createHash, randomBytes } from 'node:crypto';
import { query, queryOne } from '@/lib/db';
import { sendMail } from '@/lib/email';
import { emailButton, emailLayout, escapeHtml } from '@/lib/emailTemplate';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
const HOURS = 48;

/** The public address of the site, for links in emails (see lib/siteUrl.ts). */
export const siteOrigin = siteUrl;

/** Emails an activation link (valid 48 hours; replaces any older one). Never throws. */
export async function sendActivationEmail(userId: number, origin: string): Promise<void> {
  try {
    const user = await queryOne('select email, pending_email, first_name, email_verified_at from users where id = $1', [userId]);
    if (!user || (user.email_verified_at && !user.pending_email)) return;
    const changing = !!user.pending_email;
    const to = (user.pending_email ?? user.email) as string;
    const token = randomBytes(32).toString('hex');
    await query('delete from email_verifications where user_id = $1 or expires_at < $2', [userId, Date.now()]);
    await query('insert into email_verifications (token_hash, user_id, expires_at) values ($1, $2, $3)', [
      sha(token),
      userId,
      Date.now() + HOURS * 3_600_000,
    ]);
    const link = `${origin}/account/activate/${token}`;
    const first = escapeHtml(user.first_name as string);
    const body = `<p style="margin:0 0 14px">Hello ${first},</p>
      <p style="margin:0 0 14px">${changing ? 'Please confirm this new email address for your JKA/AF account.' : 'Thank you for creating a JKA/AF account. Please confirm your email address to activate it.'}</p>
      ${emailButton(link, changing ? 'Confirm new email' : 'Activate my account')}
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px">Or copy this link into your browser:<br><span style="word-break:break-all">${escapeHtml(link)}</span></p>
      <p style="margin:14px 0 0;color:#6b7280;font-size:13px">The link works for ${HOURS} hours. ${changing ? 'If you did not ask for this change, you can ignore this email.' : 'To order from the shop you also need your JKA/AF Individual Membership approved; we will email you when that happens. If you did not create this account, you can ignore this email.'}</p>`;
    const html = emailLayout({ title: 'Activate your account', preheader: 'Confirm your email to activate your JKA/AF account', body });
    const text = [
      `Hello ${user.first_name as string},`,
      '',
      changing ? 'Please confirm this new email address for your JKA/AF account:' : 'Thank you for creating a JKA/AF account. Please confirm your email address to activate it:',
      link,
      '',
      `The link works for ${HOURS} hours. To order from the shop you also need your JKA/AF Individual Membership approved; we will email you when that happens.`,
      'If you did not create this account, you can ignore this email.',
    ].join('\n');
    const err = await sendMail({ to, subject: changing ? 'Confirm your new JKA/AF email' : 'Activate your JKA/AF account', html, text });
    if (err) console.error('[email] activation email failed:', err);
  } catch (e) {
    console.error('[email] activation email failed:', e);
  }
}

/**
 * Emails a new activation link when this address belongs to an account that is not activated yet.
 * Says what happened so the page can tell the person: sent, no such account, or already activated.
 */
export async function resendActivation(email: string, origin: string): Promise<'sent' | 'not_found' | 'already_active'> {
  const u = await queryOne('select id, email_verified_at from users where lower(email) = $1', [email.trim().toLowerCase()]);
  if (!u) return 'not_found';
  if (u.email_verified_at) return 'already_active';
  await sendActivationEmail(u.id as number, origin);
  return 'sent';
}

export async function activationTokenValid(token: string): Promise<boolean> {
  const r = await queryOne('select 1 as ok from email_verifications where token_hash = $1 and expires_at > $2', [sha(token), Date.now()]);
  return !!r;
}

/** Marks the email as verified and uses up the link. Returns null if the link is invalid or expired; `first` is true for a brand-new account (not an email change). */
export async function activateAccount(token: string): Promise<{ userId: number; first: boolean } | null> {
  const r = await queryOne('delete from email_verifications where token_hash = $1 and expires_at > $2 returning user_id', [sha(token), Date.now()]);
  if (!r) return null;
  const before = await queryOne('select email_verified_at from users where id = $1', [r.user_id]);
  try {
    await query(
      'update users set email = coalesce(pending_email, email), pending_email = null, email_verified_at = coalesce(email_verified_at, now()) where id = $1',
      [r.user_id],
    );
  } catch (e) {
    if ((e as { code?: string }).code !== '23505') throw e;
    await query('update users set pending_email = null where id = $1', [r.user_id]); // address was taken meanwhile
    return null;
  }
  await query('delete from email_verifications where user_id = $1', [r.user_id]);
  return { userId: r.user_id as number, first: !before?.email_verified_at };
}
