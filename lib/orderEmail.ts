import 'server-only';
import { formatCents } from '@/lib/money';
import { sendMail } from '@/lib/email';
import { emailLayout, emailNote } from '@/lib/emailTemplate';
import { getOrder } from '@/lib/shop';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const br = (s: string) => esc(s).replace(/\n/g, '<br>');

const TD = 'padding:10px 8px;border-bottom:1px solid #e5e7eb';

/** Emails the customer an order confirmation with an invoice. Never throws: a mail problem must not break checkout. */
export async function sendOrderInvoice(orderId: number): Promise<void> {
  try {
    const found = await getOrder(orderId);
    if (!found || !found.order.customer_email) return;
    const { order, items } = found;

    const payableTo = process.env.CHECK_PAYABLE_TO || 'JKA/AF';
    const mailTo = process.env.CHECK_MAIL_TO || 'Please contact JKA/AF for the mailing address.';
    const date = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const name = order.customer_name || 'there';
    const address = [order.ship_name, order.ship_address, order.ship_address ? `${order.ship_city}, ${order.ship_state} ${order.ship_zip}` : '']
      .filter((l) => l.trim())
      .join('\n');
    const shippingLabel = items.every((i) => i.free_shipping) ? 'Free' : 'Included in item prices';

    const optionText = (i: (typeof items)[number]) => i.selections.map((s) => `${s.label}: ${s.value}`).join(' · ');

    const rows = items
      .map((i) => {
        const opts = optionText(i);
        const sub = [opts, i.recurring ? 'Renews yearly until canceled' : ''].filter(Boolean);
        return `<tr>
          <td style="${TD}">${esc(i.name)}${sub.map((s) => `<br><span style="color:#6b7280;font-size:13px">${esc(s)}</span>`).join('')}</td>
          <td style="${TD};text-align:center">${i.quantity}</td>
          <td style="${TD};text-align:right">${formatCents(i.unit_cents)}</td>
          <td style="${TD};text-align:right">${formatCents(i.unit_cents * i.quantity)}</td>
        </tr>`;
      })
      .join('');

    const line = (label: string, value: string, bold = false) => {
      const style = `padding:4px 8px;text-align:right;${bold ? 'font-weight:700;font-size:16px;' : ''}`;
      return `<tr><td colspan="3" style="${style}">${label}</td><td style="${style}">${value}</td></tr>`;
    };

    const body = `
      <p style="margin:0 0 18px;color:#4b5563">Hello ${esc(name)}, we received your order. Your invoice is below.</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;background:#f9fafb;border-radius:12px"><tr>
        <td style="padding:14px 18px;font-size:14px;vertical-align:top"><span style="color:#6b7280;font-size:12px;letter-spacing:1px">INVOICE</span><br><strong style="font-size:18px">Order #${order.id}</strong><br>${esc(date)}</td>
        ${address ? `<td style="padding:14px 18px;font-size:14px;vertical-align:top;text-align:right"><span style="color:#6b7280;font-size:12px;letter-spacing:1px">ADDRESS</span><br>${br(address)}</td>` : ''}
      </tr></table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
        <thead><tr style="border-bottom:2px solid #111827">
          <th style="padding:8px;text-align:left;font-size:12px;letter-spacing:1px;color:#6b7280">ITEM</th>
          <th style="padding:8px;font-size:12px;letter-spacing:1px;color:#6b7280">QTY</th>
          <th style="padding:8px;text-align:right;font-size:12px;letter-spacing:1px;color:#6b7280">PRICE</th>
          <th style="padding:8px;text-align:right;font-size:12px;letter-spacing:1px;color:#6b7280">AMOUNT</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot>
          ${line('Shipping', shippingLabel)}
          <tr><td colspan="4" style="padding:6px 0 0"><div style="border-top:2px solid #111827"></div></td></tr>
          ${line('Total due', formatCents(order.total_cents), true)}
        </tfoot>
      </table>

      ${order.notes ? `<p style="font-size:14px;margin:20px 0 0"><strong>Order notes</strong><br>${br(order.notes)}</p>` : ''}

      ${emailNote(`<strong style="font-size:15px">Pay by check - ${formatCents(order.total_cents)}</strong><br>
        Make the check payable to: <strong>${esc(payableTo)}</strong><br>
        Mail to: <strong>${br(mailTo)}</strong><br>
        Write "Order #${order.id}" on the memo line. Your order is processed once the check is received.`)}`;

    const html = emailLayout({ title: `Thank you for your order!`, preheader: `Order #${order.id} - ${formatCents(order.total_cents)}`, body });

    const text = [
      `Thank you for your order, ${name}!`,
      '',
      `INVOICE - Order #${order.id} - ${date}`,
      '',
      ...items.map((i) => {
        const opts = i.selections.map((s) => `${s.label}: ${s.value}`).join(', ');
        return `${i.quantity} x ${i.name}${opts ? ` (${opts})` : ''}  ${formatCents(i.unit_cents * i.quantity)}`;
      }),
      '',
      `Shipping: ${shippingLabel}`,
      `Total due: ${formatCents(order.total_cents)}`,
      '',
      `Pay by check - make it payable to ${payableTo}`,
      `Mail to: ${mailTo}`,
      `Write "Order #${order.id}" on the memo line. Your order is processed once the check is received.`,
    ].join('\n');

    await sendMail({
      to: order.customer_email!,
      subject: `JKA/AF order #${order.id} - invoice`,
      html,
      text,
      bcc: process.env.ORDER_NOTIFY_EMAIL || undefined,
    });
  } catch (e) {
    console.error('[email] Could not build order invoice:', e);
  }
}
