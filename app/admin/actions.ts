'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { siteUrl } from '@/lib/siteUrl';
import { after } from 'next/server';
import { sendOrderInvoice } from '@/lib/orderEmail';
import { createResetLink, sendPasswordReset } from '@/lib/passwordReset';
import { getCustomer } from '@/lib/shopAdmin';
import { sendAccountStatusEmail, sendApplicationResultEmail } from '@/lib/accountEmail';
import { requireAdmin } from '@/lib/auth';
import { formatCents, parseDollars } from '@/lib/money';
import { netPaidCents, recordCheckPayment, refundPayment, removeCheckPayment } from '@/lib/payments';
import { CARRIERS } from '@/lib/carriers';
import { normalizeUsState } from '@/lib/regions';
import { getOrderRequest, resolveOrderRequest } from '@/lib/orderRequests';
import { sendOrderRequestResultEmail, sendItemUpdateEmail, sendOrderCancelledEmail, sendOrderCompletedEmail, sendPaymentReceivedEmail } from '@/lib/customerEmails';
import { textToChoices } from '@/lib/optionsText';
import {
  deleteProduct,
  isAdminUser,
  FULFILLMENT_STATUSES,
  getOrder,
  ORDER_STATUSES,
  setItemFulfillment,
  updateOrderShipping,
  setPaymentReceived,
  reviewApplication,
  saveProduct,
  setOrderStatus,
  setProductActive,
  setStock,
  setUserStatus,
  slugTaken,
  type Order,
  type ProductOption,
} from '@/lib/shop';

// Every action re-checks admin; page/layout checks alone don't protect Server Functions.

export interface ProductPayload {
  id: number | null;
  name: string;
  slug: string;
  description: string;
  price: string;
  price_note: string;
  sale_price: string;
  sale_ends_on: string;
  image_url: string;
  /** Blank = stock is not tracked. */
  stock: string;
  physical: boolean;
  free_shipping: boolean;
  requires_dojo_approval: boolean;
  active: boolean;
  ships_note: string;
  sort: string;
  options: { id: string; label: string; type: 'select' | 'text' | 'club'; required: boolean; choicesText: string }[];
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function saveProductAction(p: ProductPayload): Promise<{ error: string } | undefined> {
  await requireAdmin();

  const name = p.name.trim();
  const slug = slugify(p.slug || name);
  const cents = parseDollars(p.price);
  if (!name) return { error: 'Name is required.' };
  if (!slug) return { error: 'Slug is required.' };
  if (cents === null) return { error: 'Price must be a dollar amount like 114 or 114.00.' };

  const salePrice = p.sale_price.trim() ? parseDollars(p.sale_price) : null;
  if (p.sale_price.trim() && salePrice === null) return { error: 'Sale price must be a dollar amount like 99 or 99.00.' };
  if (salePrice !== null && !/^\d{4}-\d{2}-\d{2}$/.test(p.sale_ends_on)) return { error: 'Choose the date the sale ends.' };
  if (salePrice !== null && salePrice >= cents) return { error: 'The sale price must be lower than the regular price.' };

  const image = p.image_url.trim();
  if (image && !/^(https?:\/\/|\/(?!\/))/.test(image)) {
    return { error: 'Image must be a link starting with https:// or a /file in the public folder.' };
  }

  let stock: number | null = null;
  if (p.stock.trim()) {
    if (!/^\d{1,6}$/.test(p.stock.trim())) return { error: 'Stock must be a whole number, or blank if not tracked.' };
    stock = parseInt(p.stock, 10);
  }

  const options: ProductOption[] = [];
  const seen = new Set<string>();
  for (const o of p.options) {
    const label = o.label.trim();
    if (!label) return { error: 'Every option needs a label.' };
    let id = slugify(o.id || label) || 'option';
    while (seen.has(id)) id += '-2';
    seen.add(id);
    const base = { id, label, type: o.type, required: o.required };
    if (o.type === 'select') {
      const choices = textToChoices(o.choicesText);
      if ('error' in choices) return { error: `${label}: ${choices.error}` };
      if (choices.length === 0) return { error: `${label}: add at least one choice.` };
      options.push({ ...base, choices });
    } else {
      options.push(base);
    }
  }

  if (await slugTaken(slug, p.id)) return { error: 'Another product already uses that slug.' };

  await saveProduct(p.id, {
    name,
    slug,
    description: p.description.trim(),
    price_cents: cents,
    price_note: p.price_note.trim(),
    image_url: image,
    sale_price_cents: salePrice,
    sale_ends_on: salePrice === null ? '' : p.sale_ends_on,
    stock,
    options,
    physical: p.physical,
    free_shipping: p.free_shipping,
    requires_dojo_approval: p.requires_dojo_approval,
    active: p.active,
    ships_note: p.ships_note.trim().slice(0, 120),
    sort: parseInt(p.sort, 10) || 0,
  });
  revalidatePath('/shop', 'layout');
  redirect('/admin/shop/products');
}

export async function toggleProductAction(id: number, active: boolean) {
  await requireAdmin();
  await setProductActive(id, active);
  revalidatePath('/shop', 'layout');
  revalidatePath('/admin/shop/products');
}

export async function deleteProductAction(id: number) {
  await requireAdmin();
  await deleteProduct(id);
  revalidatePath('/shop', 'layout');
  revalidatePath('/admin/shop/products');
}

/** Quick stock update from the products list. Blank = stop tracking. */
export async function setStockAction(id: number, fd: FormData) {
  await requireAdmin();
  const raw = String(fd.get('stock') ?? '').trim();
  if (raw === '') await setStock(id, null);
  else if (/^\d{1,6}$/.test(raw)) await setStock(id, parseInt(raw, 10));
  revalidatePath('/shop', 'layout');
  revalidatePath('/admin/shop/products');
}

export async function setOrderStatusAction(id: number, status: string) {
  await requireAdmin();
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return;
  const before = (await getOrder(id))?.order.status;
  await setOrderStatus(id, status as Order['status']);
  // Reopening a cancelled order that is still fully paid puts it back to "paid", not "awaiting payment".
  if (before === 'cancelled' && status === 'awaiting_payment') {
    const total = (await getOrder(id))?.order.total_cents ?? Infinity;
    if ((await netPaidCents(id)) >= total) await setPaymentReceived(id, true);
  }
  if (status === 'cancelled' && before !== 'cancelled') after(() => sendOrderCancelledEmail(id));
  revalidatePath('/admin', 'layout');
  revalidatePath('/shop', 'layout');
}

export async function updateOrderShippingAction(orderId: number, fd: FormData) {
  await requireAdmin();
  const f = (k: string) => String(fd.get(k) ?? '').trim().slice(0, 200);
  await updateOrderShipping(orderId, { name: f('name'), address: f('address'), city: f('city'), state: normalizeUsState(f('state')), zip: f('zip') });
  revalidatePath('/admin', 'layout');
  revalidatePath('/account', 'layout');
}

export interface RefundState {
  error?: string;
  done?: string;
}

/** "Send refund": card and PayPal refunds go through the provider; a check refund is recorded after the check is mailed. */
export async function refundPaymentAction(orderId: number, paymentId: number, _prev: RefundState, fd: FormData): Promise<RefundState> {
  const admin = await requireAdmin();
  const cents = parseDollars(String(fd.get('amount') ?? ''));
  if (cents === null) return { error: 'Enter the amount as dollars, for example 25.00.' };
  const res = await refundPayment({
    orderId,
    paymentId,
    amountCents: cents,
    reason: String(fd.get('reason') ?? '').trim().slice(0, 200),
    adminId: admin.id,
  });
  revalidatePath('/admin', 'layout');
  revalidatePath('/account', 'layout');
  if (!res.ok) return { error: res.error };
  return { done: `Refund of ${formatCents(res.amountCents)} recorded and the customer was emailed.` };
}

export async function setPaymentAction(id: number, received: boolean) {
  await requireAdmin();
  const before = (await getOrder(id))?.order.status;
  await setPaymentReceived(id, received);
  // Keep the payment records in step so a check payment can be refunded later like any other.
  if (received) await recordCheckPayment(id);
  else await removeCheckPayment(id);
  const afterStatus = (await getOrder(id))?.order.status;
  if (received && before === 'awaiting_payment') after(() => sendPaymentReceivedEmail(id));
  if (afterStatus === 'completed' && before !== 'completed') after(() => sendOrderCompletedEmail(id));
  revalidatePath('/admin', 'layout');
  revalidatePath('/shop', 'layout');
  revalidatePath('/account', 'layout');
}

export async function setItemFulfillmentAction(orderId: number, itemId: number, fd: FormData) {
  await requireAdmin();
  const status = String(fd.get('fulfillment') ?? '');
  if (!(FULFILLMENT_STATUSES as readonly string[]).includes(status)) return;
  const tracking = String(fd.get('tracking') ?? '').trim().slice(0, 120);
  const carrier = String(fd.get('carrier') ?? '').trim();
  const found = await getOrder(orderId);
  const prev = found?.items.find((i) => i.id === itemId);
  await setItemFulfillment(
    orderId,
    itemId,
    status as (typeof FULFILLMENT_STATUSES)[number],
    (CARRIERS as readonly string[]).includes(carrier) ? carrier : '',
    tracking,
  );
  let emailed = false;
  const now = await getOrder(orderId);
  const item = now?.items.find((i) => i.id === itemId);
  // Email on a new status, or when the tracking details of a shipped item change.
  if (prev && item && item.fulfillment !== 'pending') {
    const changed = item.fulfillment !== prev.fulfillment || (item.fulfillment === 'shipped' && (item.tracking !== prev.tracking || item.carrier !== prev.carrier));
    if (changed) {
      emailed = true;
      after(() => sendItemUpdateEmail(orderId, itemId));
    }
  }
  // The shipped / completed email already tells the customer; only send "order complete" when nothing else went out.
  if (!emailed && found && now && now.order.status === 'completed' && found.order.status !== 'completed') after(() => sendOrderCompletedEmail(orderId));
  revalidatePath('/admin', 'layout');
  revalidatePath('/account', 'layout');
}

export async function setUserStatusAction(id: number, status: string) {
  const admin = await requireAdmin();
  if (id === admin.id) return;
  if (await isAdminUser(id)) return;
  if (status !== 'approved' && status !== 'rejected' && status !== 'pending') return;
  await setUserStatus(id, status);
  if (status === 'approved' || status === 'rejected') after(() => sendAccountStatusEmail(id, status));
  revalidatePath('/admin', 'layout');
}

export async function reviewApplicationAction(id: number, status: 'approved' | 'rejected', fd: FormData) {
  await requireAdmin();
  if (status !== 'approved' && status !== 'rejected') return;
  await reviewApplication(id, status, String(fd.get('note') ?? '').trim().slice(0, 1000));
  after(() => sendApplicationResultEmail(id));
  revalidatePath('/admin', 'layout');
  redirect('/admin/dojo/applications');
}


export interface ResetState {
  error?: string;
  ok?: string;
  link?: string;
}

const siteOrigin = siteUrl;

/** Emails the customer a link to choose a new password. */
export async function sendCustomerResetEmailAction(userId: number, _prev: ResetState): Promise<ResetState> {
  await requireAdmin();
  const c = await getCustomer(userId);
  if (!c) return { error: 'Customer not found.' };
  const err = await sendPasswordReset(c.customer.email, await siteOrigin());
  return err ? { error: `Could not send the email: ${err}` } : { ok: `Reset email sent to ${c.customer.email}.` };
}

/** Creates a reset link to give to the customer yourself (valid for 1 hour). */
export async function createCustomerResetLinkAction(userId: number, _prev: ResetState): Promise<ResetState> {
  await requireAdmin();
  const c = await getCustomer(userId);
  if (!c) return { error: 'Customer not found.' };
  return { link: await createResetLink(userId, await siteOrigin()) };
}

/** Sends the order confirmation / invoice email to the customer again. */
export async function resendInvoiceAction(orderId: number) {
  await requireAdmin();
  after(() => sendOrderInvoice(orderId));
  revalidatePath(`/admin/shop/orders/${orderId}`);
}

/** Approve or decline a customer's cancel / return / refund request. Approving a cancellation cancels the order. */
export async function resolveOrderRequestAction(requestId: number, decision: 'approved' | 'declined', fd: FormData) {
  await requireAdmin();
  const r = await getOrderRequest(requestId);
  if (!r || r.status !== 'pending') return;
  const done = await resolveOrderRequest(requestId, decision, String(fd.get('note') ?? '').trim());
  if (!done) return;
  if (decision === 'approved' && r.type === 'cancel') {
    const before = (await getOrder(r.order_id))?.order.status;
    if (before && before !== 'cancelled') await setOrderStatus(r.order_id, 'cancelled');
  }
  after(() => sendOrderRequestResultEmail(requestId));
  revalidatePath('/admin', 'layout');
  revalidatePath('/shop', 'layout');
  revalidatePath('/account', 'layout');
}
