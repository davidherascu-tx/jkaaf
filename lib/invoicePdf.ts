import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { query } from '@/lib/db';
import { getAddresses } from '@/lib/addresses';
import { formatCents } from '@/lib/money';
import { CONTACT_PHONE, contactEmail } from '@/lib/contact';
import { METHOD_LABEL } from '@/lib/payments/config';
import { fulfillmentLabel, type Order, type OrderItem } from '@/lib/shop';

const W = 612;
const H = 792;
const M = 48;
const RED = rgb(0.83, 0.16, 0.11);
const INK = rgb(0.07, 0.09, 0.15);
const MUTED = rgb(0.42, 0.45, 0.5);
const LINE = rgb(0.88, 0.89, 0.91);
const GREEN = rgb(0.09, 0.5, 0.24);

// The built-in PDF fonts only cover Latin-1.
const clean = (s: string) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/×/g, 'x')
    .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, '?');

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of clean(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) <= width) line = test;
      else {
        if (line) out.push(line);
        line = word;
      }
    }
    out.push(line);
  }
  return out;
}

/** An invoice while the order is unpaid, a receipt once payment is received. */
export const isPaid = (o: Pick<Order, 'status'>) => o.status === 'paid' || o.status === 'completed';

/** Builds the invoice / receipt PDF for one order. */
export async function buildInvoicePdf(order: Order, items: OrderItem[]): Promise<Uint8Array> {
  const paid = isPaid(order);
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page: PDFPage = doc.addPage([W, H]);
  let y = H - M;

  const text = (t: string, x: number, yy: number, size = 10, font = regular, color = INK) =>
    page.drawText(clean(t), { x, y: yy, size, font, color });
  const right = (t: string, xr: number, yy: number, size = 10, font = regular, color = INK) =>
    text(t, xr - font.widthOfTextAtSize(clean(t), size), yy, size, font, color);
  const rule = (yy: number, color = LINE, thickness = 1) =>
    page.drawLine({ start: { x: M, y: yy }, end: { x: W - M, y: yy }, thickness, color });
  const ensure = (needed: number) => {
    if (y - needed < M + 40) {
      page = doc.addPage([W, H]);
      y = H - M;
    }
  };

  // Header: logo, organisation, document title
  try {
    const logo = await doc.embedPng(await readFile(path.join(process.cwd(), 'public', 'jkaaf_logo_email.png')));
    const s = 52 / logo.height;
    page.drawImage(logo, { x: M, y: y - 52, width: logo.width * s, height: 52 });
  } catch {
    /* the logo is optional */
  }
  text('Japan Karate Association / American Federation', M + 66, y - 22, 12, bold);
  text([contactEmail(), CONTACT_PHONE].filter(Boolean).join('  |  '), M + 66, y - 38, 9, regular, MUTED);
  right('INVOICE', W - M, y - 24, 24, bold, RED);
  y -= 74;
  rule(y, RED, 2);
  y -= 26;

  // Order facts (left) and status (right)
  const date = new Date(order.created_at.replace(' ', 'T') + 'Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  text(`Order #${order.id}`, M, y, 14, bold);
  text(`Date: ${date}`, M, y - 16, 10, regular, MUTED);
  text(`Payment method: ${METHOD_LABEL[order.payment_method] ?? order.payment_method}`, M, y - 30, 10, regular, MUTED);
  if (paid) {
    // A tilted stamp with a double border, like an ink stamp: PAID (or REFUNDED once everything was sent back).
    const refunded = (order.refunded_cents ?? 0) >= order.total_cents;
    const label = refunded ? 'REFUNDED' : 'PAID';
    const color = refunded ? MUTED : GREEN;
    const size = 26;
    const boxW = bold.widthOfTextAtSize(label, size) + 30;
    const boxH = 46;
    const tilt = 8;
    const rad = (tilt * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x0 = W - M - boxW - 6;
    const y0 = y - 44;
    // Everything is rotated around the box's lower-left corner, so inner pieces are moved by the same rotation.
    const at = (dx: number, dy: number) => ({ x: x0 + dx * cos - dy * sin, y: y0 + dx * sin + dy * cos });
    page.drawRectangle({ x: x0, y: y0, width: boxW, height: boxH, borderColor: color, borderWidth: 3, rotate: degrees(tilt) });
    page.drawRectangle({ ...at(5, 5), width: boxW - 10, height: boxH - 10, borderColor: color, borderWidth: 1, rotate: degrees(tilt) });
    page.drawText(label, { ...at(15, 13), size, font: bold, color, rotate: degrees(tilt) });
    const paidAt = (await query('select max(created_at) as d from payments where order_id = $1', [order.id]))[0]?.d as Date | null | undefined;
    if (paidAt) {
      const when = new Date(paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
      right(`${refunded ? 'Refunded' : 'Payment received'} ${when}`, W - M, y0 - 14, 9, regular, MUTED);
    }
  } else {
    right('AMOUNT DUE', W - M, y, 9, bold, MUTED);
    right(formatCents(order.total_cents), W - M, y - 20, 18, bold, INK);
  }
  y -= paid ? 70 : 58;

  // Bill to / Ship to
  const billing = (await getAddresses(order.user_id)).billing;
  const block = (title: string, lines: string[], x: number) => {
    text(title, x, y, 8, bold, MUTED);
    let yy = y - 14;
    for (const l of lines.filter(Boolean)) {
      for (const w of wrap(l, regular, 10, 230)) {
        text(w, x, yy);
        yy -= 13;
      }
    }
    return yy;
  };
  const billLines = billing
    ? [billing.name, billing.line1, `${billing.city}, ${billing.state} ${billing.zip}`, order.customer_email ?? '']
    : [order.customer_name ?? '', order.customer_email ?? ''];
  const shipLines = order.ship_address ? [order.ship_name, order.ship_address, `${order.ship_city}, ${order.ship_state} ${order.ship_zip}`] : [];
  const yBill = block('BILL TO', billLines, M);
  const yShip = shipLines.length ? block('SHIP TO', shipLines, W / 2 + 10) : y;
  y = Math.min(yBill, yShip) - 18;

  // Items table
  const colQty = W - M - 200;
  const colPrice = W - M - 100;
  const colAmt = W - M;
  rule(y + 12, INK, 1.5);
  text('ITEM', M, y, 8, bold, MUTED);
  right('QTY', colQty, y, 8, bold, MUTED);
  right('PRICE', colPrice, y, 8, bold, MUTED);
  right('AMOUNT', colAmt, y, 8, bold, MUTED);
  y -= 12;
  rule(y, LINE);
  y -= 16;

  for (const i of items) {
    const sub = [
      ...i.selections.map((s) => `${s.label}: ${s.value}`),
      ...(i.recurring ? ['Renews every year until canceled'] : []),
      ...(i.fulfillment !== 'pending' && order.status !== 'cancelled'
        ? [`${fulfillmentLabel(i.fulfillment, i.physical)}${i.carrier ? ` via ${i.carrier}` : ''}${i.tracking ? `, tracking ${i.tracking}` : ''}`]
        : []),
    ];
    const nameLines = wrap(i.name, bold, 10, colQty - M - 40);
    const subLines = sub.flatMap((s) => wrap(s, regular, 8.5, colQty - M - 40));
    ensure((nameLines.length + subLines.length) * 13 + 14);
    nameLines.forEach((l, n) => text(l, M, y - n * 13, 10, bold));
    right(String(i.quantity), colQty, y);
    right(formatCents(i.unit_cents), colPrice, y);
    right(formatCents(i.unit_cents * i.quantity), colAmt, y);
    let yy = y - nameLines.length * 13;
    for (const l of subLines) {
      text(l, M, yy + 2, 8.5, regular, MUTED);
      yy -= 11;
    }
    y = yy - 4;
    rule(y + 8, LINE);
    y -= 10;
  }

  // Totals
  ensure(90);
  const shippingLabel = items.every((i) => i.free_shipping) ? 'Free' : 'Included in item prices';
  text('Shipping', colQty - 90, y, 10, regular, MUTED);
  right(shippingLabel, colAmt, y);
  y -= 8;
  rule(y, INK, 1.5);
  y -= 20;
  text(paid ? 'Total paid' : 'Total due', colQty - 90, y, 13, bold);
  right(formatCents(order.total_cents), colAmt, y, 13, bold);
  y -= 36;

  // Payment instructions (invoice) or thank-you (receipt)
  if (paid) {
    text('Payment received. Thank you for supporting JKA/AF!', M, y, 10, bold, GREEN);
    y -= 14;
    text('Memberships are valid for the calendar year they are ordered in (January 1 to December 31).', M, y, 9, regular, MUTED);
  } else if (order.payment_method !== 'check') {
    text('HOW TO PAY', M, y, 8, bold, MUTED);
    y -= 15;
    text(`Pay ${formatCents(order.total_cents)} online: open this order in your JKA/AF account and choose Pay now.`, M, y, 10, bold);
  } else {
    const payableTo = process.env.CHECK_PAYABLE_TO || 'JKA/AF';
    const mailTo = process.env.CHECK_MAIL_TO || 'Please contact JKA/AF for the mailing address.';
    ensure(110);
    text('HOW TO PAY', M, y, 8, bold, MUTED);
    y -= 15;
    text(`Pay by check for ${formatCents(order.total_cents)}, payable to: ${payableTo}`, M, y, 10, bold);
    y -= 14;
    text('Mail to:', M, y, 10, regular, MUTED);
    for (const l of wrap(mailTo, regular, 10, 400)) {
      text(l, M + 44, y);
      y -= 13;
    }
    y -= 2;
    text(`Write "Order #${order.id}" on the memo line. Your order is processed once the check is received.`, M, y, 9, regular, MUTED);
  }

  return doc.save();
}
