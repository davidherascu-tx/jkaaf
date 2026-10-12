import 'server-only';
import { formatCents } from '@/lib/money';
import { sendMail } from '@/lib/email';
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
    const subtotal = order.total_cents - order.tax_cents;
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

    const html = `<!doctype html><html><body style="margin:0;background:#f4f3ef;font-family:Arial,Helvetica,sans-serif;color:#111827">
<div style="max-width:640px;margin:0 auto;padding:24px">
  <div style="background:#fff;border-radius:12px;padding:28px">
    <h1 style="margin:0 0 4px;font-size:22px">Thank you for your order, ${esc(name)}!</h1>
    <p style="margin:0 0 20px;color:#4b5563">We received your order. Your invoice is below.</p>

    <table style="width:100%;font-size:14px;margin-bottom:20px"><tr>
      <td style="vertical-align:top"><strong>INVOICE</strong><br>Order #${order.id}<br>${esc(date)}</td>
      <td style="vertical-align:top;text-align:right"><strong>JKA/AF</strong><br>Japan Karate Association / American Federation</td>
    </tr></table>

    ${address ? `<p style="font-size:14px;margin:0 0 20px"><strong>Address</strong><br>${br(address)}</p>` : ''}

    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead><tr style="background:#f9fafb">
        <th style="padding:8px;text-align:left">Item</th><th style="padding:8px">Qty</th>
        <th style="padding:8px;text-align:right">Price</th><th style="padding:8px;text-align:right">Amount</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        ${line('Subtotal', formatCents(subtotal))}
        ${line('Shipping', shippingLabel)}
        ${line('Sales tax', formatCents(order.tax_cents))}
        ${line('Total due', formatCents(order.total_cents), true)}
      </tfoot>
    </table>

    ${order.notes ? `<p style="font-size:14px;margin:20px 0 0"><strong>Order notes</strong><br>${br(order.notes)}</p>` : ''}

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin-top:24px;font-size:14px">
      <strong>Pay by check — ${formatCents(order.total_cents)}</strong><br>
      Make the check payable to: <strong>${esc(payableTo)}</strong><br>
      Mail to: <strong>${br(mailTo)}</strong><br>
      Write “Order #${order.id}” on the memo line. Your order is processed once the check is received.
    </div>
  </div>
</div></body></html>`;

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
      `Subtotal: ${formatCents(subtotal)}`,
      `Shipping: ${shippingLabel}`,
      `Sales tax: ${formatCents(order.tax_cents)}`,
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
