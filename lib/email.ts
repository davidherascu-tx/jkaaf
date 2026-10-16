import 'server-only';
import nodemailer from 'nodemailer';
import path from 'node:path';

// Sends mail through YOUR SMTP server. Configure it in .env.local:
//   SMTP_HOST=smtp.yourprovider.com
//   SMTP_PORT=587            (587 = STARTTLS, 465 = SSL)
//   SMTP_SECURE=false        (true for port 465)
//   SMTP_USER=...  SMTP_PASS=...
//   EMAIL_FROM="JKA/AF <orders@yourdomain.com>"
// Optional: EMAIL_REPLY_TO, ORDER_NOTIFY_EMAIL (BCC copy of every order invoice).
// Until SMTP_HOST and EMAIL_FROM are set, emails are skipped and logged so the shop keeps working.

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  bcc?: string;
  attachments?: { filename: string; content: Uint8Array; contentType?: string }[];
}

export function emailConfig() {
  const port = Number(process.env.SMTP_PORT || 587);
  return {
    host: process.env.SMTP_HOST ?? '',
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.EMAIL_FROM ?? '',
    replyTo: process.env.EMAIL_REPLY_TO ?? '',
    notify: process.env.ORDER_NOTIFY_EMAIL ?? '',
  };
}

export const isEmailConfigured = () => {
  const c = emailConfig();
  return !!c.host && !!c.from;
};

function transport() {
  const c = emailConfig();
  return nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.secure,
    auth: c.user ? { user: c.user, pass: c.pass } : undefined,
  });
}

/**
 * Addresses that must never receive mail from the site. Default: jkaafusa@gmail.com while the website is not live.
 * Change it with EMAIL_BLOCKLIST (comma separated; set it to "none" to turn the block off when you go live).
 */
const blocked = (): Set<string> => {
  const raw = process.env.EMAIL_BLOCKLIST ?? 'jkaafusa@gmail.com';
  return new Set(raw.split(',').map((a) => a.trim().toLowerCase()).filter((a) => a && a !== 'none'));
};

/** Sends one email. Returns null on success, or an error message. Never throws. */
export async function sendMail(mail: Mail): Promise<string | null> {
  const block = blocked();
  if (block.has(mail.to.trim().toLowerCase())) {
    console.warn(`[email] blocked: "${mail.subject}" was not sent to ${mail.to} (EMAIL_BLOCKLIST).`);
    return 'This address is blocked from receiving email.';
  }
  if (mail.bcc && block.has(mail.bcc.trim().toLowerCase())) mail = { ...mail, bcc: undefined };
  if (!isEmailConfigured()) {
    console.warn(`[email] SMTP not configured (set SMTP_HOST and EMAIL_FROM); skipped "${mail.subject}" to ${mail.to}`);
    return 'Email is not configured yet.';
  }
  const c = emailConfig();
  try {
    await transport().sendMail({
      from: c.from,
      to: mail.to,
      bcc: mail.bcc || undefined,
      replyTo: c.replyTo || undefined,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: [
        // Logo used by the email layout (<img src="cid:logo">).
        { filename: 'logo.png', path: path.join(process.cwd(), 'public', 'jkaaf_logo_email.png'), cid: 'logo' },
        ...(mail.attachments ?? []).map((a) => ({ filename: a.filename, content: Buffer.from(a.content), contentType: a.contentType })),
      ],
    });
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not send the email.';
    console.error(`[email] Could not send "${mail.subject}" to ${mail.to}: ${msg}`);
    return msg;
  }
}

export { escapeHtml, simpleEmail } from '@/lib/emailTemplate';
