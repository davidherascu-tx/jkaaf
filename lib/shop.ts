import 'server-only';
import { query, queryOne, type DbRow, ts } from '@/lib/db';
import { toUser, USER_COLS, type User } from '@/lib/auth';
import { currentPriceCents, needsJkaApproval, type Product, type ProductInput } from '@/lib/products';

// ---------- Products ----------

export { isOnSale, currentPriceCents, needsJkaApproval } from '@/lib/products';
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
    ships_note: (r.ships_note as string) ?? '',
    options: (r.options as Product['options']) ?? [],
    physical: !!r.physical,
    requires_dojo_approval: !!r.requires_dojo_approval,
    active: !!r.active,
    sort: r.sort as number,
  };
}

export async function listProducts(includeInactive = false): Promise<Product[]> {
  const where = includeInactive ? '' : 'where active';
  return (await query(`select * from products ${where} order by sort, id`)).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const r = await queryOne('select * from products where slug = $1', [slug]);
  return r ? toProduct(r) : null;
}

export async function getProductById(id: number): Promise<Product | null> {
  const r = await queryOne('select * from products where id = $1', [id]);
  return r ? toProduct(r) : null;
}

export async function saveProduct(id: number | null, p: ProductInput): Promise<number> {
  // jsonb values are passed as JSON text (pg would turn a JS array into a Postgres array).
  const values = [
    p.name,
    p.slug,
    p.description,
    p.price_cents,
    p.price_note,
    p.image_url,
    p.sale_price_cents,
    p.sale_ends_on,
    p.stock,
    p.free_shipping,
    JSON.stringify(p.options),
    p.physical,
    p.requires_dojo_approval,
    p.active,
    p.ships_note,
    p.sort,
  ];
  if (id === null) {
    const r = await queryOne(
      `insert into products (name, slug, description, price_cents, price_note, image_url, sale_price_cents, sale_ends_on,
         stock, free_shipping, options, physical, requires_dojo_approval, active, ships_note, sort)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15, $16) returning id`,
      values,
    );
    return r!.id as number;
  }
  await query(
    `update products set name = $1, slug = $2, description = $3, price_cents = $4, price_note = $5, image_url = $6,
       sale_price_cents = $7, sale_ends_on = $8, stock = $9, free_shipping = $10, options = $11::jsonb, physical = $12,
       requires_dojo_approval = $13, active = $14, ships_note = $15, sort = $16
     where id = $17`,
    [...values, id],
  );
  return id;
}

export async function deleteProduct(id: number) {
  const used = await queryOne('select count(*) as n from order_items where product_id = $1', [id]);
  if ((used?.n as number) > 0) {
    // Keep order history intact: hide instead of delete.
    await query('update products set active = false where id = $1', [id]);
    return 'archived' as const;
  }
  await query('delete from products where id = $1', [id]);
  return 'deleted' as const;
}

export async function setStock(id: number, stock: number | null) {
  await query('update products set stock = $1 where id = $2', [stock, id]);
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
  jkaApproved: boolean,
): PricedLine | { error: string } {
  let unit = currentPriceCents(product);
  let recurring = false;
  let needsShipping = product.physical;
  const lines: { label: string; value: string }[] = [];

  if (needsJkaApproval(product) && !jkaApproved) {
    return { error: 'This product requires an approved JKA/AF Individual Membership.' };
  }
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
      if (opt.id === 'sticker_card') needsShipping = true;
    } else if (opt.type === 'club') {
      if (!approvedClubs.includes(value)) return { error: 'Choose a club from your approved applications.' };
    } else if (value.length > 200) {
      return { error: `${opt.label} is too long` };
    }
    lines.push({ label: opt.label, value });
  }
  return { unitCents: unit, lines, recurring, needsShipping };
}

/** Has an admin approved this member's JKA/AF Individual Membership? Guests never have. */
export async function isJkaApproved(userId: number | undefined): Promise<boolean> {
  if (userId === undefined) return false;
  const r = await queryOne("select 1 as ok from users where id = $1 and status = 'approved'", [userId]);
  return !!r;
}

export async function approvedClubNames(userId: number): Promise<string[]> {
  const rows = await query(
    "select dojo_name from dojo_applications where user_id = $1 and status = 'approved' order by dojo_name",
    [userId],
  );
  return rows.map((r) => r.dojo_name as string);
}

// ---------- Cart ----------

/** A cart belongs to a signed-in user or, for guests, to a cookie token. */
export type CartOwner = { userId: number; token?: undefined } | { userId?: undefined; token: string };

/** SQL condition (and its parameter) restricting a query to this owner's cart rows; the parameter is $`n`. */
function ownerCond(o: CartOwner, n: number): [string, string | number] {
  return o.userId !== undefined ? [`user_id = $${n}`, o.userId] : [`cart_token = $${n}`, o.token];
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
  const jka = await isJkaApproved(owner.userId);
  const [cond, param] = ownerCond(owner, 1);
  const rows = await query(`select * from cart_items where ${cond} order by id`, [param]);
  if (rows.length === 0) return [];

  const ids = [...new Set(rows.map((r) => r.product_id as number))];
  const products = new Map(
    (await query('select * from products where id = any($1::bigint[])', [ids])).map((r) => [r.id as number, toProduct(r)]),
  );

  // Total units per product across all lines, for the stock check.
  const perProduct = new Map<number, number>();
  for (const r of rows) perProduct.set(r.product_id as number, (perProduct.get(r.product_id as number) ?? 0) + (r.quantity as number));

  const lines: CartLine[] = [];
  for (const r of rows) {
    const product = products.get(r.product_id as number);
    if (!product || !product.active) {
      await query('delete from cart_items where id = $1', [r.id]);
      continue;
    }
    const selections = (r.selections ?? {}) as Selections;
    const stockErr = stockProblem(product, perProduct.get(product.id) ?? 0);
    lines.push({
      id: r.id as number,
      product,
      selections,
      quantity: r.quantity as number,
      priced: stockErr ? { error: stockErr } : priceItem(product, selections, clubs, jka),
    });
  }
  return lines;
}

export async function cartCount(owner: CartOwner): Promise<number> {
  const [cond, param] = ownerCond(owner, 1);
  const rows = await query(`select quantity from cart_items where ${cond}`, [param]);
  return rows.reduce((s, r) => s + (r.quantity as number), 0);
}

export async function addToCart(
  owner: CartOwner,
  product: Product,
  selections: Selections,
  quantity: number,
): Promise<string | null> {
  const clubs = owner.userId !== undefined ? await approvedClubNames(owner.userId) : [];
  const priced = priceItem(product, selections, clubs, await isJkaApproved(owner.userId));
  if ('error' in priced) return priced.error;

  const [cond, param] = ownerCond(owner, 1);
  const sameProduct = await query(`select id, quantity, selections from cart_items where ${cond} and product_id = $2`, [param, product.id]);
  const inCart = sameProduct.reduce((s, r) => s + (r.quantity as number), 0);
  const stockErr = stockProblem(product, inCart + quantity);
  if (stockErr) return stockErr;

  const existing = sameProduct.find((r) => canonical((r.selections ?? {}) as Selections) === canonical(selections));
  if (existing) {
    await query('update cart_items set quantity = $1 where id = $2', [Math.min((existing.quantity as number) + quantity, 99), existing.id]);
  } else {
    await query('insert into cart_items (user_id, cart_token, product_id, selections, quantity) values ($1, $2, $3, $4::jsonb, $5)', [
      owner.userId ?? null,
      owner.token ?? null,
      product.id,
      JSON.stringify(selections),
      quantity,
    ]);
  }
  return null;
}

export async function setCartQuantity(owner: CartOwner, itemId: number, quantity: number) {
  const [cond, param] = ownerCond(owner, 2);
  if (quantity <= 0) {
    await query(`delete from cart_items where id = $1 and ${cond}`, [itemId, param]);
  } else {
    await query(`update cart_items set quantity = $3 where id = $1 and ${cond}`, [itemId, param, Math.min(quantity, 99)]);
  }
}

/** Move a guest cart into a user's cart (called after sign in / sign up). */
export async function mergeGuestCart(token: string, userId: number) {
  await query('select merge_guest_cart($1, $2)', [token, userId]);
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
  items_total?: number;
  items_done?: number;
  /** Not shipped / Partly shipped / Shipped / Delivered / No shipping. */
  shipping?: string;
}
export interface OrderItem {
  id: number;
  name: string;
  unit_cents: number;
  quantity: number;
  selections: { label: string; value: string }[];
  recurring: boolean;
  free_shipping: boolean;
  /** Physical products are shipped; the rest (memberships, renewals) are just completed. */
  physical: boolean;
  fulfillment: 'pending' | 'shipped' | 'fulfilled';
  tracking: string;
  carrier: string;
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
  const saved = await queryOne("select count(*) as n from addresses where user_id = $1 and kind in ('billing', 'shipping')", [user.id]);
  if (Number(saved!.n) < 2) return { error: 'Please add your billing and shipping address in your account before ordering.' };
  const cart = await getCart({ userId: user.id });
  if (cart.length === 0) return { error: 'Your cart is empty.' };
  let total = 0;
  for (const l of cart) {
    if ('error' in l.priced) return { error: `${l.product.name}: ${l.priced.error}` };
    total += l.priced.unitCents * l.quantity;
  }

  // One database function does stock check + order + items + empty cart atomically.
  const items = cart.map((l) => {
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
  });
  try {
    const r = await queryOne('select place_order($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb) as id', [
      user.id,
      total,
      ship.name,
      ship.address,
      ship.city,
      ship.state,
      ship.zip,
      notes,
      JSON.stringify(items),
    ]);
    return { orderId: Number(r!.id) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not place the order.' };
  }
}

const toOrder = (r: Row): Order => {
  const hasCustomer = r.customer_email != null;
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
    created_at: ts(r.created_at as Date),
    customer_name: hasCustomer ? `${r.customer_first} ${r.customer_last}` : undefined,
    customer_email: hasCustomer ? (r.customer_email as string) : undefined,
    items_total: Number(r.items_total ?? 0),
    items_done: Number(r.items_done ?? 0),
    shipping: shippingSummary(Number(r.ship_total ?? 0), Number(r.ship_pending ?? 0), Number(r.ship_shipped ?? 0)),
  };
};

/** Order-level shipping wording from the counts of items that ship. */
export function shippingSummary(total: number, pending: number, shipped: number): string {
  if (total === 0) return 'No shipping';
  if (pending === total) return 'Not shipped';
  if (pending > 0) return 'Partly shipped';
  return shipped > 0 ? 'Shipped' : 'Delivered';
}

/** SQL for the shipping counts: items that ship are physical products or a membership sticker / card. */
const SHIPS = "(p.physical or x.selections::text ilike '%sticker or card%')";
const ORDER_SELECT = `select o.*, u.first_name as customer_first, u.last_name as customer_last, u.email as customer_email,
    (select count(*) from order_items x where x.order_id = o.id) as items_total,
    (select count(*) from order_items x where x.order_id = o.id and x.fulfillment <> 'pending') as items_done,
    (select count(*) from order_items x left join products p on p.id = x.product_id where x.order_id = o.id and ${SHIPS}) as ship_total,
    (select count(*) from order_items x left join products p on p.id = x.product_id where x.order_id = o.id and ${SHIPS} and x.fulfillment = 'pending') as ship_pending,
    (select count(*) from order_items x left join products p on p.id = x.product_id where x.order_id = o.id and ${SHIPS} and x.fulfillment = 'shipped') as ship_shipped
  from orders o left join users u on u.id = o.user_id`;

export async function listOrders(userId?: number): Promise<Order[]> {
  const where = userId !== undefined ? 'where o.user_id = $1' : '';
  return (await query(`${ORDER_SELECT} ${where} order by o.id desc`, userId !== undefined ? [userId] : [])).map(toOrder);
}

export async function getOrder(id: number): Promise<{ order: Order; items: OrderItem[] } | null> {
  const o = await queryOne(`${ORDER_SELECT} where o.id = $1`, [id]);
  if (!o) return null;
  const items = (
    await query(
      'select oi.*, coalesce(p.physical, false) as physical from order_items oi left join products p on p.id = oi.product_id where oi.order_id = $1 order by oi.id',
      [id],
    )
  ).map((r) => ({
    id: r.id as number,
    name: r.name as string,
    unit_cents: r.unit_cents as number,
    quantity: r.quantity as number,
    selections: (r.selections ?? []) as OrderItem['selections'],
    recurring: !!r.recurring,
    free_shipping: r.free_shipping !== false,
    physical: !!r.physical || ((r.selections ?? []) as { label: string }[]).some((x) => /sticker|card/i.test(x.label)),
    fulfillment: r.fulfillment as OrderItem['fulfillment'],
    tracking: (r.tracking as string) ?? '',
    carrier: (r.carrier as string) ?? '',
  }));
  return { order: toOrder(o), items };
}

export const ORDER_STATUSES = ['awaiting_payment', 'paid', 'completed', 'cancelled'] as const;
export const ORDER_STATUS_LABEL: Record<Order['status'], string> = {
  awaiting_payment: 'Awaiting check',
  paid: 'Payment received',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const FULFILLMENT_STATUSES = ['pending', 'shipped', 'fulfilled'] as const;

/** Wording for an item's fulfilment: shipped goods vs. things that are just issued/completed. */
export function fulfillmentLabel(f: OrderItem['fulfillment'], physical: boolean): string {
  if (f === 'pending') return physical ? 'Not shipped' : 'Pending';
  if (f === 'shipped') return 'Shipped';
  return physical ? 'Delivered' : 'Completed';
}

/** Payment received + every item shipped (or completed) = order completed; setting an item back to pending reopens the order. */
async function syncOrderCompletion(orderId: number) {
  await query(
    "update orders set status = 'completed' where id = $1 and status = 'paid' and not exists (select 1 from order_items where order_id = $1 and fulfillment = 'pending')",
    [orderId],
  );
  await query(
    "update orders set status = 'paid' where id = $1 and status = 'completed' and exists (select 1 from order_items where order_id = $1 and fulfillment = 'pending')",
    [orderId],
  );
}

export async function setItemFulfillment(
  orderId: number,
  itemId: number,
  fulfillment: OrderItem['fulfillment'],
  carrier: string,
  tracking: string,
) {
  await query('update order_items set fulfillment = $3, carrier = $4, tracking = $5 where id = $1 and order_id = $2', [
    itemId,
    orderId,
    fulfillment,
    carrier,
    tracking,
  ]);
  await syncOrderCompletion(orderId);
}

/** Payment received / not received. Stock and cancellation stay in set_order_status. */
export async function setPaymentReceived(orderId: number, received: boolean) {
  await query('select set_order_status($1, $2)', [orderId, received ? 'paid' : 'awaiting_payment']);
  if (received) await syncOrderCompletion(orderId);
}

/** Changing status also keeps stock right: cancelling returns items to stock, reopening takes them again. */
export async function setOrderStatus(id: number, status: Order['status']) {
  await query('select set_order_status($1, $2)', [id, status]);
}

// ---------- Members ----------

export async function listUsers(status?: string): Promise<User[]> {
  const where = status ? 'where status = $1' : '';
  return (await query(`select ${USER_COLS} from users ${where} order by id desc`, status ? [status] : [])).map(toUser);
}

/** The customer asks JKA/AF to approve their Individual Membership (also lets a rejected member ask again). */
export async function requestApproval(id: number, d: { dojo: string; rank: string; note: string }) {
  await query(
    "update users set status = 'pending', approval_requested_at = now(), dojo = $2, rank = $3, approval_note = $4 where id = $1 and status <> 'approved'",
    [id, d.dojo, d.rank, d.note],
  );
}

export async function setUserStatus(id: number, status: User['status']) {
  await query('update users set status = $1 where id = $2', [status, id]);
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
    created_at: ts(r.created_at as Date),
    reviewed_at: r.reviewed_at ? ts(r.reviewed_at as Date) : null,
    applicant_email: (r.applicant_email as string | null) ?? undefined,
  };
}

export async function createApplication(userId: number, data: Record<string, string>, signature: string) {
  const r = await queryOne(
    'insert into dojo_applications (user_id, dojo_name, chief_instructor, data, signature) values ($1, $2, $3, $4::jsonb, $5) returning id',
    [userId, data.dojo_name, data.chief_instructor, JSON.stringify(data), signature],
  );
  return r!.id as number;
}

const APP_SELECT = `select a.*, u.email as applicant_email
  from dojo_applications a left join users u on u.id = a.user_id`;

export async function listApplications(userId?: number): Promise<DojoApplication[]> {
  const where = userId !== undefined ? 'where a.user_id = $1' : '';
  const apps = (await query(`${APP_SELECT} ${where} order by a.id desc`, userId !== undefined ? [userId] : [])).map(toApplication);
  // Pending first when listing everything for the admin.
  return userId === undefined ? apps.sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending')) : apps;
}

export async function getApplication(id: number): Promise<DojoApplication | null> {
  const r = await queryOne(`${APP_SELECT} where a.id = $1`, [id]);
  return r ? toApplication(r) : null;
}

export async function reviewApplication(id: number, status: 'approved' | 'rejected', note: string) {
  // The member's JKA/AF Individual Membership approval is separate (setUserStatus).
  await query('update dojo_applications set status = $1, admin_note = $2, reviewed_at = now() where id = $3', [status, note, id]);
}

// ---------- Admin overview ----------

export async function adminCounts() {
  const r = await queryOne(`select
    (select count(*) from users where status = 'pending' and approval_requested_at is not null) as pending_users,
    (select count(*) from dojo_applications where status = 'pending') as pending_apps,
    (select count(*) from orders where status = 'awaiting_payment') as open_orders,
    (select count(*) from products where active and stock is not null and stock <= 5) as low_stock`);
  return {
    pendingUsers: r!.pending_users as number,
    pendingApps: r!.pending_apps as number,
    openOrders: r!.open_orders as number,
    lowStock: r!.low_stock as number,
  };
}

export async function slugTaken(slug: string, exceptId: number | null): Promise<boolean> {
  const r = await queryOne('select id from products where slug = $1', [slug]);
  return !!r && r.id !== exceptId;
}

export async function setProductActive(id: number, active: boolean) {
  await query('update products set active = $1 where id = $2', [active, id]);
}

export async function isAdminUser(id: number): Promise<boolean> {
  const r = await queryOne('select role from users where id = $1', [id]);
  return r?.role === 'admin';
}

export async function getPasswordHash(id: number): Promise<string | null> {
  const r = await queryOne('select password_hash from users where id = $1', [id]);
  return r ? (r.password_hash as string) : null;
}

export async function setPasswordHash(id: number, password_hash: string) {
  await query('update users set password_hash = $1 where id = $2', [password_hash, id]);
}

export async function findLoginUser(
  email: string,
): Promise<{ id: number; password_hash: string; role: string; email_verified: boolean } | null> {
  const r = await queryOne('select id, password_hash, role, (email_verified_at is not null) as email_verified from users where email = $1', [email]);
  return r
    ? { id: r.id as number, password_hash: r.password_hash as string, role: r.role as string, email_verified: !!r.email_verified }
    : null;
}

// ---------- Individual Membership purchases ----------

export interface MembershipPurchase {
  item_id: number;
  order_id: number;
  order_status: Order['status'];
  ordered_at: string;
  selections: { label: string; value: string }[];
  recurring: boolean;
  canceled: boolean;
}

/** Individual Membership lines on this member's orders (cancelled orders left out), newest first. */
export async function listMembershipPurchases(userId: number): Promise<MembershipPurchase[]> {
  const rows = await query(
    `select oi.id as item_id, oi.order_id, oi.selections, oi.recurring, oi.subscription_canceled_at,
            o.status as order_status, o.created_at as ordered_at
       from order_items oi
       join orders o on o.id = oi.order_id
       left join products p on p.id = oi.product_id
      where o.user_id = $1 and o.status <> 'cancelled'
        and (p.slug = 'jkaaf-individual-membership' or oi.name = 'JKA/AF Individual Membership')
      order by oi.id desc`,
    [userId],
  );
  return rows.map((r) => ({
    item_id: r.item_id as number,
    order_id: r.order_id as number,
    order_status: r.order_status as Order['status'],
    ordered_at: ts(r.ordered_at as Date),
    selections: (r.selections ?? []) as MembershipPurchase['selections'],
    recurring: !!r.recurring,
    canceled: !!r.subscription_canceled_at,
  }));
}

/** Stops a yearly subscription renewing. Only the order's owner can do this. */
export async function cancelSubscription(userId: number, itemId: number) {
  await query(
    `update order_items set subscription_canceled_at = now()
      where id = $1 and recurring and subscription_canceled_at is null
        and order_id in (select id from orders where user_id = $2)`,
    [itemId, userId],
  );
}

/** Admin fix for the address on an order (does not touch the customer's saved addresses). */
export async function updateOrderShipping(orderId: number, s: ShippingInfo) {
  await query('update orders set ship_name = $2, ship_address = $3, ship_city = $4, ship_state = $5, ship_zip = $6 where id = $1', [
    orderId,
    s.name,
    s.address,
    s.city,
    s.state,
    s.zip,
  ]);
}
