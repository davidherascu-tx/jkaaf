import 'server-only';
import { getUserById } from '@/lib/auth';
import { siteUrl } from '@/lib/siteUrl';
import { sendMail } from '@/lib/email';
import { emailButton, emailLayout, emailNote, escapeHtml } from '@/lib/emailTemplate';
import { trackingUrl } from '@/lib/carriers';
import { fulfillmentLabel, getOrder } from '@/lib/shop';
import { formatCents } from '@/lib/money';
import { buildInvoicePdf } from '@/lib/invoicePdf';
import { isExpired, timeLeftText, validThroughText } from '@/lib/membership';

const link = async (path: string) => (await siteUrl()) + path;

interface Content {
  to: string;
  subject: string;
  title: string;
  /** Plain-text paragraphs (escaped for the HTML version). */
  lines: string[];
  button?: { label: string; path: string };
  /** Trusted HTML shown in a highlighted box under the text. */
  noteHtml?: string;
  noteText?: string;
  attachments?: { filename: string; content: Uint8Array; contentType?: string }[];
}

/** Sends one branded customer email. Never throws: a mail problem must not break the action that triggered it. */
async function send(c: Content): Promise<void> {
  try {
    const url = c.button ? await link(c.button.path) : '';
    const body = `${c.lines.map((l) => `<p style="margin:0 0 14px">${escapeHtml(l)}</p>`).join('')}
      ${c.noteHtml ? emailNote(c.noteHtml, 'green') : ''}
      ${url ? emailButton(url, c.button!.label) : ''}`;
    const html = emailLayout({ title: c.title, preheader: c.lines[0], body });
    const text = [...c.lines, ...(c.noteText ? ['', c.noteText] : []), ...(url ? ['', `${c.button!.label}: ${url}`] : [])].join('\n');
    const err = await sendMail({ to: c.to, subject: c.subject, html, text, attachments: c.attachments });
    if (err) console.error(`[email] "${c.subject}" not sent:`, err);
  } catch (e) {
    console.error(`[email] "${c.subject}" failed:`, e);
  }
}

// ───────── Account ─────────

/** Sent right after the customer activates their account. */
export async function sendWelcomeEmail(userId: number): Promise<void> {
  const u = await getUserById(userId);
  if (!u) return;
  await send({
    to: u.email,
    subject: 'Welcome to JKA/AF',
    title: `Welcome, ${u.first_name}!`,
    lines: [
      'Your JKA/AF account is active. Thank you for joining us.',
      'To order from the JKA/AF shop you need your JKA/AF Individual Membership approved. Sign in, open Membership in your account and request approval; we will email you as soon as it is reviewed.',
      'Please also save your billing and shipping address in your account, so checkout is quick.',
      'Questions? Just reply to this email or contact JKA/AF through our website.',
    ],
    button: { label: 'Go to my account', path: '/account' },
  });
}

/** Confirms to the customer that their membership approval request was received. */
export async function sendApprovalRequestReceivedEmail(userId: number): Promise<void> {
  const u = await getUserById(userId);
  if (!u) return;
  await send({
    to: u.email,
    subject: 'We received your membership request',
    title: 'Membership request received',
    lines: [
      `Hello ${u.first_name},`,
      'We received your request for JKA/AF Individual Membership approval. An administrator will review it and email you the result.',
    ],
    button: { label: 'View my membership', path: '/account/membership' },
  });
}

export async function sendPasswordChangedEmail(userId: number): Promise<void> {
  const u = await getUserById(userId);
  if (!u) return;
  await send({
    to: u.email,
    subject: 'Your JKA/AF password was changed',
    title: 'Password changed',
    lines: [
      `Hello ${u.first_name},`,
      'The password for your JKA/AF account was just changed. If this was you, there is nothing more to do.',
      'If it was not you, reset your password right away and contact JKA/AF.',
    ],
    button: { label: 'Reset my password', path: '/account/forgot' },
  });
}

/** Tells the customer their subscription was canceled and how long the paid membership still lasts. */
export async function sendSubscriptionCanceledEmail(userId: number, year: number, name: string): Promise<void> {
  const u = await getUserById(userId);
  if (!u) return;
  const until = validThroughText(year);
  const left = isExpired(year) ? '' : ` (${timeLeftText(year)})`;
  await send({
    to: u.email,
    subject: 'Your JKA/AF subscription was canceled',
    title: 'Subscription canceled',
    lines: [
      `Hello ${u.first_name},`,
      `Your yearly subscription for ${name} was canceled and will not renew.`,
      isExpired(year)
        ? `Your ${year} membership ended on ${until}.`
        : `You paid for ${year}, so your membership stays active until ${until}${left}.`,
    ],
    noteHtml: isExpired(year) ? undefined : `<strong>Membership valid through ${escapeHtml(until)}</strong>`,
    noteText: isExpired(year) ? undefined : `Membership valid through ${until}`,
    button: { label: 'View my membership', path: '/account/membership' },
  });
}

/** Tells JKA/AF a customer canceled their subscription. */
export async function sendSubscriptionCanceledAdminEmail(userId: number, orderId: number, year: number, name: string): Promise<void> {
  const to = process.env.APPLICATION_NOTIFY_EMAIL || process.env.ORDER_NOTIFY_EMAIL || '';
  if (!to) {
    console.warn('[email] Set APPLICATION_NOTIFY_EMAIL (or ORDER_NOTIFY_EMAIL) to be told when customers cancel a subscription.');
    return;
  }
  const u = await getUserById(userId);
  if (!u) return;
  await send({
    to,
    subject: `Subscription canceled: ${u.first_name} ${u.last_name}`,
    title: 'A customer canceled a subscription',
    lines: [
      `${u.first_name} ${u.last_name} (${u.email}) canceled the yearly subscription for ${name} (order #${orderId}).`,
      isExpired(year)
        ? `That membership year (${year}) has already ended.`
        : `They paid for ${year}, so their membership stays active until ${validThroughText(year)} (${timeLeftText(year)}).`,
    ],
    button: { label: 'See all subscriptions', path: '/admin/shop/subscriptions' },
  });
}

// ───────── Orders ─────────

async function orderContext(orderId: number) {
  const found = await getOrder(orderId);
  if (!found || !found.order.customer_email) return null;
  return { ...found, name: (found.order.customer_name || '').split(' ')[0] || 'there', to: found.order.customer_email };
}

const orderButton = (id: number) => ({ label: `View order #${id}`, path: `/shop/orders/${id}` });

/** `preview` sends a copy to another address with "[TEST]" in the subject (to see how the email looks). */
export async function sendPaymentReceivedEmail(orderId: number, preview?: { to: string }): Promise<void> {
  const o = await orderContext(orderId);
  if (!o) return;
  // The invoice, now stamped PAID, so the customer has it for their records. If it cannot be built the email still goes out.
  let attachments: Content['attachments'];
  try {
    attachments = [
      {
        filename: `jkaaf-invoice-order-${o.order.id}-paid.pdf`,
        content: await buildInvoicePdf(o.order, o.items),
        contentType: 'application/pdf',
      },
    ];
  } catch (e) {
    console.error(`[email] could not build the PAID invoice for order ${o.order.id}:`, e);
  }
  await send({
    to: preview?.to ?? o.to,
    subject: `${preview ? '[TEST] ' : ''}Payment received for order #${o.order.id}`,
    title: 'Payment received',
    lines: [
      `Hello ${o.name},`,
      `Thank you! We received your payment of ${formatCents(o.order.total_cents)} for order #${o.order.id}.`,
      attachments
        ? 'Your invoice, stamped PAID, is attached to this email for your records.'
        : 'You can download your invoice from your order page.',
      'We are now processing your order. You will get another email when items ship or are completed.',
    ],
    button: orderButton(o.order.id),
    attachments,
  });
}

/** An item shipped, was delivered, or (for memberships and renewals) was completed. */
export async function sendItemUpdateEmail(orderId: number, itemId: number): Promise<void> {
  const o = await orderContext(orderId);
  const item = o?.items.find((i) => i.id === itemId);
  if (!o || !item || item.fulfillment === 'pending') return;
  const label = fulfillmentLabel(item.fulfillment, item.physical);
  const shipped = item.fulfillment === 'shipped';
  const url = trackingUrl(item.carrier, item.tracking);
  const tracking = [item.carrier && `Shipping provider: ${item.carrier}`, item.tracking && `Tracking number: ${item.tracking}`].filter(Boolean) as string[];
  await send({
    to: o.to,
    subject: shipped ? `Your order #${o.order.id} has shipped` : `${item.name}: ${label.toLowerCase()} (order #${o.order.id})`,
    title: shipped ? 'Your item has shipped' : item.physical ? 'Your item was delivered' : 'Your item is complete',
    lines: [
      `Hello ${o.name},`,
      shipped
        ? `${item.quantity} × ${item.name} from order #${o.order.id} is on its way.`
        : item.physical
          ? `${item.quantity} × ${item.name} from order #${o.order.id} was marked as delivered.`
          : `${item.quantity} × ${item.name} from order #${o.order.id} is complete.`,
    ],
    noteHtml: tracking.length
      ? `${tracking.map(escapeHtml).join('<br>')}${url ? `<br><a href="${escapeHtml(url)}" style="color:#d4281c;font-weight:700">Track your package</a>` : ''}`
      : undefined,
    noteText: tracking.length ? [...tracking, ...(url ? [`Track your package: ${url}`] : [])].join('\n') : undefined,
    button: orderButton(o.order.id),
  });
}

export async function sendOrderCompletedEmail(orderId: number): Promise<void> {
  const o = await orderContext(orderId);
  if (!o) return;
  await send({
    to: o.to,
    subject: `Order #${o.order.id} is complete`,
    title: 'Your order is complete',
    lines: [`Hello ${o.name},`, `Everything in order #${o.order.id} has been paid for and completed. Thank you for supporting JKA/AF!`],
    button: orderButton(o.order.id),
  });
}

/** A refund was sent (or, for a check payment, a refund check was mailed). */
export async function sendRefundEmail(orderId: number, amountCents: number, provider: string): Promise<void> {
  const o = await orderContext(orderId);
  if (!o) return;
  const money = formatCents(amountCents);
  await send({
    to: o.to,
    subject: `Refund for order #${o.order.id}`,
    title: 'Your refund is on its way',
    lines: [
      `Hello ${o.name},`,
      provider === 'check'
        ? `We are sending you a refund of ${money} for order #${o.order.id} by check. It will arrive by mail.`
        : `We refunded ${money} for order #${o.order.id} to your ${provider === 'paypal' ? 'PayPal account' : 'card'}. It can take 5 to 10 business days to show up.`,
    ],
    button: orderButton(o.order.id),
  });
}

export async function sendOrderCancelledEmail(orderId: number): Promise<void> {
  const o = await orderContext(orderId);
  if (!o) return;
  await send({
    to: o.to,
    subject: `Order #${o.order.id} was cancelled`,
    title: 'Your order was cancelled',
    lines: [
      `Hello ${o.name},`,
      `Order #${o.order.id} was cancelled. If you did not expect this, or already sent a check, please contact JKA/AF.`,
    ],
    button: orderButton(o.order.id),
  });
}
