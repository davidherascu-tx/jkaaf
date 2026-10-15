import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { query, queryOne } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { sendMail } from '@/lib/email';
import { emailButton, emailLayout, escapeHtml } from '@/lib/emailTemplate';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
const HOURS = 1;

/** Creates a one-time reset link (valid for an hour) and replaces any older one for that user. */
export async function createResetLink(userId: number, origin: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  await query('delete from password_resets where user_id = $1 or expires_at < $2', [userId, Date.now()]);
  await query('insert into password_resets (token_hash, user_id, expires_at) values ($1, $2, $3)', [
    sha(token),
    userId,
    Date.now() + HOURS * 3_600_000,
  ]);
  return `${origin}/account/reset/${token}`;
}

/** Creates a one-time reset link for this email and emails it. Does nothing (silently) if the email has no account. */
export async function sendPasswordReset(email: string, origin: string): Promise<string | null> {
  const to = email.trim().toLowerCase();
  const user = await queryOne('select id, first_name from users where lower(email) = $1', [to]);
  if (!user) return null;
  const link = await createResetLink(user.id as number, origin);
  const first = escapeHtml(user.first_name as string);
  const body = `<p style="margin:0 0 14px">Hello ${first},</p>
    <p style="margin:0 0 14px">We received a request to reset your password. Use the button below within ${HOURS} hour to choose a new one.</p>
    ${emailButton(link, 'Choose a new password')}
    <p style="margin:0 0 8px;color:#6b7280;font-size:13px">Or copy this link into your browser:<br><span style="word-break:break-all">${escapeHtml(link)}</span></p>
    <p style="margin:14px 0 0;color:#6b7280;font-size:13px">If you did not ask for this, you can ignore this email. Your password will not change.</p>`;
  const html = emailLayout({ title: 'Reset your password', preheader: 'Choose a new JKA/AF password', body });
  const text = [
    `Hello ${user.first_name as string},`,
    '',
    `We received a request to reset your password. Use this link within ${HOURS} hour to choose a new one:`,
    link,
    '',
    'If you did not ask for this, you can ignore this email. Your password will not change.',
  ].join('\n');
  return sendMail({ to, subject: 'Reset your JKA/AF password', html, text });
}

export async function resetTokenValid(token: string): Promise<boolean> {
  const r = await queryOne('select 1 as ok from password_resets where token_hash = $1 and expires_at > $2', [sha(token), Date.now()]);
  return !!r;
}

/** Sets the new password and uses up the link. Signs the user out everywhere. Returns an error message or null. */
export async function resetPassword(token: string, password: string): Promise<string | null> {
  const r = await queryOne('select user_id from password_resets where token_hash = $1 and expires_at > $2', [sha(token), Date.now()]);
  if (!r) return 'This reset link is invalid or has expired. Please request a new one.';
  await query('update users set password_hash = $1 where id = $2', [hashPassword(password), r.user_id]);
  await query('delete from password_resets where user_id = $1', [r.user_id]);
  await query('delete from sessions where user_id = $1', [r.user_id]);
  return null;
}
