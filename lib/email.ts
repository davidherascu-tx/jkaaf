import 'server-only';

// Sends mail through Resend's HTTP API (https://resend.com). No package needed.
// Set RESEND_API_KEY and EMAIL_FROM (an address on a domain verified in Resend) in .env.local.
// Until they are set, emails are skipped and logged so checkout keeps working.

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  bcc?: string;
}

export async function sendMail(mail: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn(`[email] Not configured (set RESEND_API_KEY and EMAIL_FROM); skipped "${mail.subject}" to ${mail.to}`);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        reply_to: process.env.EMAIL_REPLY_TO || undefined,
        bcc: mail.bcc ? [mail.bcc] : undefined,
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend rejected "${mail.subject}" (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[email] Could not send:', e);
    return false;
  }
}
