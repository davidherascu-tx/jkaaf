import 'server-only';
import { db, ok, one, type DbRow, rows as list, ts } from '@/lib/db';
import { toUser, USER_COLS, type User } from '@/lib/auth';
import { currentPriceCents, type Product, type ProductInput } from '@/lib/products';

// ---------- Products ----------

export { isOnSale, currentPriceCents } from '@/lib/products';
export type { Choice, Product, ProductInput, ProductOption } from '@/lib/products';

type Row = DbRow;

function toProduct(r: Row): Product {
  return {
    id: r.id as number,
    slug: r.slug as string,
    name: r.name as string,
    description: r.description as string,
    price_cents: r.price_cents as number,
    price_note: r.price_note as string,
    image_url: r.image_url as string,
    sale_price_cents: (r.sale_price_cents as number | null) ?? null,
    sale_ends_on: (r.sale_ends_on as string) ?? '',
    stock: (r.stock as number | null) ?? null,
    free_shipping: r.free_shipping !== false,
    options: (r.options as Product['options']) ?? [],
    physical: !!r.physical,
    requires_dojo_approval: !!r.requires_dojo_approval,
    active: !!r.active,
    sort: r.sort as number,
  };
}

export async function listProducts(includeInactive = false): Promise<Product[]> {
  let q = db().from('products').select('*');
  if (!includeInactive) q = q.eq('active', true);
  return list(await q.order('sort').order('id')).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const r = ok(await db().from('products').select('*').eq('slug', slug).maybeSingle());
  return r ? toProduct(r) : null;
}

export async function getProductById(id: number): Promise<Product | null> {
  const r = ok(await db().from('products').select('*').eq('id', id).maybeSingle());
  return r ? toProduct(r) : null;
}

export async function saveProduct(id: number | null, p: ProductInput): Promise<number> {
  const row = {
    name: p.name,
    slug: p.slug,
    description: p.description,
    price_cents: p.price_cents,
    price_note: p.price_note,
    image_url: p.image_url,
    sale_price_cents: p.sale_price_cents,
    sale_ends_on: p.sale_ends_on,
    stock: p.stock,
    free_shipping: p.free_shipping,
    options: p.options,
    physical: p.physical,
    requires_dojo_approval: p.requires_dojo_approval,
    active: p.active,
    sort: p.sort,
  };
  if (id === null) {
    return one(await db().from('products').insert(row).select('id').single()).id as number;
  }
  ok(await db().from('products').update(row).eq('id', id));
  return id;
}

export async function deleteProduct(id: number) {
  const used = await db().from('order_items').select('*', { count: 'exact', head: true }).eq('product_id', id);
  if (used.error) throw new Error(used.error.message);
  if ((used.count ?? 0) > 0) {
    // Keep order history intact: hide instead of delete.
    ok(await db().from('products').update({ active: false }).eq('id', id));
    return 'archived' as const;
  }
  ok(await db().from('products').delete().eq('id', id));
  return 'deleted' as const;
}

export async function setStock(id: number, stock: number | null) {
  ok(await db().from('products').update({ stock }).eq('id', id));
}

export const isSoldOut = (p: Product) => p.stock !== null && p.stock <= 0;

// ---------- Pricing ----------

export type Selections = Record<string, string>;
export interface PricedLine {
  unitCents: number;
  lines: { label: string; value: string }[];
  recurring: boolean;
  needsShipping: boolean;
}

/** Validates selections against the product definition and computes the unit price. */
export function priceItem(
  product: Product,
  selections: Selections,
  approvedClubs: string[],
): PricedLine | { error: string } {
  let unit = currentPriceCents(product);
  let recurring = false;
  let needsShipping = product.physical;
  const lines: { label: string; value: string }[] = [];

  if (product.requires_dojo_approval && approvedClubs.length === 0) {
    return { error: 'This product requires an approved Dojo Membership application.' };
  }

  for (const opt of product.options) {
    const value = (selections[opt.id] ?? '').trim();
    if (!value) {
      if (opt.required) return { error: `Please choose: ${opt.label}` };
      continue;
    }
    if (opt.type === 'select') {
      const choice = opt.choices?.find((c) => c.label === value);
      if (!choice) return { error: `Invalid choice for ${opt.label}` };
      unit += choice.priceCents;
      if (choice.recurring) recurring = true;
      if (choice.noShip) needsShipping = false;
    } else if (opt.type === 'club') {
      if (!approvedClubs.includes(value)) return { error: 'Choose a club from your approved applications.' };
    } else if (value.length > 200) {
      return { error: `${opt.label} is too long` };
    }
    lines.push({ label: opt.label, value });
  }
  return { unitCents: unit, lines, recurring, needsShipping };
}

export async function approvedClubNames(userId: number): Promise<string[]> {
  const rows = list(
    await db()
      .from('dojo_applications')
      .select('dojo_name')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .order('dojo_name'),
  );
  return rows.map((r) => r.dojo_name as string);
}

// ---------- Cart ----------

/** A cart belongs to a signed-in user or, for guests, to a cookie token. */
export type CartOwner = { userId: number; token?: undefined } | { userId?: undefined; token: string };

/** Restricts a query to this owner's cart rows. */
function forOwner<T>(q: T, o: CartOwner): T {
  const f = q as unknown as { eq(column: string, value: string | number): T };
  return o.userId !== undefined ? f.eq('user_id', o.userId) : f.eq('cart_token', o.token);
}

export interface CartLine {
  id: number;
  product: Product;
  selections: Selections;
  quantity: number;
  priced: PricedLine | { error: string };
}

/** Message if the product cannot supply `wanted` units in total (cart + this request), otherwise null. */
function stockProblem(product: Product, wanted: number): string | null {
  if (product.stock === null) return null;
  if (product.stock <= 0) return `${product.name} is out of stock.`;
  if (wanted > product.stock) return `Only ${product.stock} of ${product.name} in stock.`;
  return null;
}

const canonical = (s: Selections) => JSON.stringify(Object.keys(s).sort().map((k) => [k, s[k]]));

export async function getCart(owner: CartOwner): Promise<CartLine[]> {
  const clubs = owner.userId !== undefined ? await approvedClubNames(owner.userId) : [];
  const rows = list(await forOwner(db().from('cart_items').select('*'), owner).order('id'));
  if (rows.length === 0) return [];

  const ids = [...new Set(rows.map((r) => r.product_id as number))];
  const products = new Map(list(await db().from('products').select('*').in('id', ids)).map((r) => [r.id as number, toProduct(r)]));

  // Total units per product across all lines, for the stock check.
  const perProduct = new Map<number, number>();
  for (const r of rows) perProduct.set(r.product_id as number, (perProduct.get(r.product_id as number) ?? 0) + (r.quantity as number));

  const lines: CartLine[] = [];
  for (const r of rows) {
    const product = products.get(r.product_id as number);
    if (!product || !product.active) {
      ok(await db().from('cart_items').delete().eq('id', r.id));
      continue;
    }
    const selections = (r.selections ?? {}) as Selections;
    const stockErr = stockProblem(product, perProduct.get(product.id) ?? 0);
    lines.push({
      id: r.id as number,
      product,
      selections,
      quantity: r.quantity as number,
      priced: stockErr ? { error: stockErr } : priceItem(product, selections, clubs),
    });
  }
  return lines;
}

export async function cartCount(owner: CartOwner): Promise<number> {
  const rows = list(await forOwner(db().from('cart_items').select('quantity'), owner));
  return rows.reduce((s, r) => s + (r.quantity as number), 0);
}

export async function addToCart(
  owner: CartOwner,
  product: Product,
  selections: Selections,
  quantity: number,
): Promise<string | null> {
  const clubs = owner.userId !== undefined ? await approvedClubNames(owner.userId) : [];
  const priced = priceItem(product, selections, clubs);
  if ('error' in priced) return priced.error;

  const sameProduct = list(await forOwner(db().from('cart_items').select('id, quantity, selections'), owner).eq('product_id', product.id));
  const inCart = sameProduct.reduce((s, r) => s + (r.quantity as number), 0);
  const stockErr = stockProblem(product, inCart + quantity);
  if (stockErr) return stockErr;

  const existing = sameProduct.find((r) => canonical((r.selections ?? {}) as Selections) === canonical(selections));
  if (existing) {
    ok(
      await db()
        .from('cart_items')
        .update({ quantity: Math.min((existing.quantity as number) + quantity, 99) })
        .eq('id', existing.id),
    );
  } else {
    ok(
      await db().from('cart_items').insert({
        user_id: owner.userId ?? null,
        cart_token: owner.token ?? null,
        product_id: product.id,
        selections,
        quantity,
      }),
    );
  }
  return null;
}

export async function setCartQuantity(owner: CartOwner, itemId: number, quantity: number) {
  if (quantity <= 0) {
    ok(await forOwner(db().from('cart_items').delete().eq('id', itemId), owner));
  } else {
    ok(await forOwner(db().from('cart_items').update({ quantity: Math.min(quantity, 99) }).eq('id', itemId), owner));
  }
}

/** Move a guest cart into a user's cart (called after sign in / sign up). */
export async function mergeGuestCart(token: string, userId: number) {
  ok(await db().rpc('merge_guest_cart', { p_token: token, p_user_id: userId }));
}

// ---------- Orders ----------

export interface Order {
  id: number;
  user_id: number;
  status: 'awaiting_payment' | 'paid' | 'completed' | 'cancelled';
  payment_method: string;
  total_cents: number;
  ship_name: string;
  ship_address: string;
  ship_city: string;
  ship_state: string;
  ship_zip: string;
  notes: string;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
}
export interface OrderItem {
  id: number;
  name: string;
  unit_cents: number;
  quantity: number;
  selections: { label: string; value: string }[];
  recurring: boolean;
  free_shipping: boolean;
}

export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export function cartNeedsShipping(cart: CartLine[]): boolean {
  return cart.some((l) => !('error' in l.priced) && l.priced.needsShipping);
}

export async function placeOrder(
  user: User,
  ship: ShippingInfo,
  notes: string,
): Promise<{ orderId: number } | { error: string }> {
  const cart = await getCart({ userId: user.id });
  if (cart.length === 0) return { error: 'Your cart is empty.' };
  let total = 0;
  for (const l of cart) {
    if ('error' in l.priced) return { error: `${l.product.name}: ${l.priced.error}` };
    total += l.priced.unitCents * l.quantity;
  }

  // One database function does stock check + order + items + empty cart atomically.
  const res = await db().rpc('place_order', {
    p_user_id: user.id,
    p_total: total,
    p_ship_name: ship.name,
    p_ship_address: ship.address,
    p_ship_city: ship.city,
    p_ship_state: ship.state,
    p_ship_zip: ship.zip,
    p_notes: notes,
    p_items: cart.map((l) => {
      const p = l.priced as PricedLine;
      return {
        product_id: l.product.id,
        name: l.product.name,
        unit_cents: p.unitCents,
        quantity: l.quantity,
        selections: p.lines,
        recurring: p.recurring,
        free_shipping: l.product.free_shipping,
      };
    }),
  });
  if (res.error) return { error: res.error.message };
  return { orderId: Number(res.data) };
}

const toOrder = (r: Row): Order => {
  const u = r.users as { first_name: string; last_name: string; email: string } | null;
  return {
    id: r.id as number,
    user_id: r.user_id as number,
    status: r.status as Order['status'],
    payment_method: r.payment_method as string,
    total_cents: r.total_cents as number,
    ship_name: r.ship_name as string,
    ship_address: r.ship_address as string,
    ship_city: r.ship_city as string,
    ship_state: r.ship_state as string,
    ship_zip: r.ship_zip as string,
    notes: r.notes as string,
    created_at: ts(r.created_at as string),
    customer_name: u ? `${u.first_name} ${u.last_name}` : undefined,
    customer_email: u?.email,
  };
};

const ORDER_SELECT = '*, users(first_name, last_name, email)';

export async function listOrders(userId?: number): Promise<Order[]> {
  let q = db().from('orders').select(ORDER_SELECT);
  if (userId !== undefined) q = q.eq('user_id', userId);
  return list(await q.order('id', { ascending: false })).map(toOrder);
}

export async function getOrder(id: number): Promise<{ order: Order; items: OrderItem[] } | null> {
  const o = ok(await db().from('orders').select(ORDER_SELECT).eq('id', id).maybeSingle());
  if (!o) return null;
  const items = list(await db().from('order_items').select('*').eq('order_id', id).order('id')).map((r) => ({
    id: r.id as number,
    name: r.name as string,
    unit_cents: r.unit_cents as number,
    quantity: r.quantity as number,
    selections: (r.selections ?? []) as OrderItem['selections'],
    recurring: !!r.recurring,
    free_shipping: r.free_shipping !== false,
  }));
  return { order: toOrder(o), items };
}

export const ORDER_STATUSES = ['awaiting_payment', 'paid', 'completed', 'cancelled'] as const;
export const ORDER_STATUS_LABEL: Record<Order['status'], string> = {
  awaiting_payment: 'Awaiting check',
  paid: 'Paid',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** Changing status also keeps stock right: cancelling returns items to stock, reopening takes them again. */
export async function setOrderStatus(id: number, status: Order['status']) {
  ok(await db().rpc('set_order_status', { p_id: id, p_status: status }));
}

// ---------- Members ----------

export async function listUsers(status?: string): Promise<User[]> {
  let q = db().from('users').select(USER_COLS);
  if (status) q = q.eq('status', status);
  return list(await q.order('id', { ascending: false })).map(toUser);
}

export async function setUserStatus(id: number, status: User['status']) {
  ok(await db().from('users').update({ status }).eq('id', id));
}

// ---------- Dojo applications ----------

export interface DojoApplication {
  id: number;
  user_id: number;
  dojo_name: string;
  chief_instructor: string;
  status: 'pending' | 'approved' | 'rejected';
  data: Record<string, string>;
  signature: string;
  admin_note: string;
  created_at: string;
  reviewed_at: string | null;
  applicant_email?: string;
}

function toApplication(r: Row): DojoApplication {
  return {
    id: r.id as number,
    user_id: r.user_id as number,
    dojo_name: r.dojo_name as string,
    chief_instructor: r.chief_instructor as string,
    status: r.status as DojoApplication['status'],
    data: (r.data ?? {}) as Record<string, string>,
    signature: r.signature as string,
    admin_note: r.admin_note as string,
    created_at: ts(r.created_at as string),
    reviewed_at: r.reviewed_at ? ts(r.reviewed_at as string) : null,
    applicant_email: (r.users as { email: string } | null)?.email,
  };
}

export async function createApplication(userId: number, data: Record<string, string>, signature: string) {
  return one(
    await db()
      .from('dojo_applications')
      .insert({ user_id: userId, dojo_name: data.dojo_name, chief_instructor: data.chief_instructor, data, signature })
      .select('id')
      .single(),
  ).id as number;
}

const APP_SELECT = '*, users(email)';

export async function listApplications(userId?: number): Promise<DojoApplication[]> {
  let q = db().from('dojo_applications').select(APP_SELECT);
  if (userId !== undefined) q = q.eq('user_id', userId);
  const apps = list(await q.order('id', { ascending: false })).map(toApplication);
  // Pending first when listing everything for the admin.
  return userId === undefined ? apps.sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending')) : apps;
}

export async function getApplication(id: number): Promise<DojoApplication | null> {
  const r = ok(await db().from('dojo_applications').select(APP_SELECT).eq('id', id).maybeSingle());
  return r ? toApplication(r) : null;
}

export async function reviewApplication(id: number, status: 'approved' | 'rejected', note: string) {
  const app = ok(
    await db()
      .from('dojo_applications')
      .update({ status, admin_note: note, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select('user_id')
      .maybeSingle(),
  );
  if (status === 'approved' && app) {
    // Approving a dojo also approves the applicant's member account.
    ok(await db().from('users').update({ status: 'approved' }).eq('id', app.user_id).eq('status', 'pending'));
  }
}

// ---------- Admin overview ----------

export async function adminCounts() {
  const head = (table: string) => db().from(table).select('*', { count: 'exact', head: true });
  const n = (r: { count: number | null; error: { message: string } | null }) => {
    if (r.error) throw new Error(r.error.message);
    return r.count ?? 0;
  };
  const [pendingUsers, pendingApps, openOrders, lowStock] = await Promise.all([
    head('users').eq('status', 'pending'),
    head('dojo_applications').eq('status', 'pending'),
    head('orders').eq('status', 'awaiting_payment'),
    head('products').eq('active', true).not('stock', 'is', null).lte('stock', 5),
  ]);
  return { pendingUsers: n(pendingUsers), pendingApps: n(pendingApps), openOrders: n(openOrders), lowStock: n(lowStock) };
}

export async function slugTaken(slug: string, exceptId: number | null): Promise<boolean> {
  const r = ok(await db().from('products').select('id').eq('slug', slug).maybeSingle());
  return !!r && r.id !== exceptId;
}

export async function setProductActive(id: number, active: boolean) {
  ok(await db().from('products').update({ active }).eq('id', id));
}

export async function isAdminUser(id: number): Promise<boolean> {
  const r = ok(await db().from('users').select('role').eq('id', id).maybeSingle());
  return r?.role === 'admin';
}

export async function getPasswordHash(id: number): Promise<string | null> {
  const r = ok(await db().from('users').select('password_hash').eq('id', id).maybeSingle());
  return r ? (r.password_hash as string) : null;
}

export async function setPasswordHash(id: number, password_hash: string) {
  ok(await db().from('users').update({ password_hash }).eq('id', id));
}

export async function findLoginUser(email: string): Promise<{ id: number; password_hash: string } | null> {
  const r = ok(await db().from('users').select('id, password_hash').eq('email', email).maybeSingle());
  return r ? { id: r.id as number, password_hash: r.password_hash as string } : null;
}
