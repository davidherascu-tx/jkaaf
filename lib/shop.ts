import 'server-only';
import { query, queryOne, type DbRow, ts } from '@/lib/db';
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
    p.sort,
  ];
  if (id === null) {
    const r = await queryOne(
      `insert into products (name, slug, description, price_cents, price_note, image_url, sale_price_cents, sale_ends_on,
         stock, free_shipping, options, physical, requires_dojo_approval, active, sort)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15) returning id`,
      values,
    );
    return r!.id as number;
  }
  await query(
    `update products set name = $1, slug = $2, description = $3, price_cents = $4, price_note = $5, image_url = $6,
       sale_price_cents = $7, sale_ends_on = $8, stock = $9, free_shipping = $10, options = $11::jsonb, physical = $12,
       requires_dojo_approval = $13, active = $14, sort = $15
     where id = $16`,
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
      priced: stockErr ? { error: stockErr } : priceItem(product, selections, clubs),
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
  const priced = priceItem(product, selections, clubs);
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
  };
};

const ORDER_SELECT = `select o.*, u.first_name as customer_first, u.last_name as customer_last, u.email as customer_email
  from orders o left join users u on u.id = o.user_id`;

export async function listOrders(userId?: number): Promise<Order[]> {
  const where = userId !== undefined ? 'where o.user_id = $1' : '';
  return (await query(`${ORDER_SELECT} ${where} order by o.id desc`, userId !== undefined ? [userId] : [])).map(toOrder);
}

export async function getOrder(id: number): Promise<{ order: Order; items: OrderItem[] } | null> {
  const o = await queryOne(`${ORDER_SELECT} where o.id = $1`, [id]);
  if (!o) return null;
  const items = (await query('select * from order_items where order_id = $1 order by id', [id])).map((r) => ({
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
  await query('select set_order_status($1, $2)', [id, status]);
}

// ---------- Members ----------

export async function listUsers(status?: string): Promise<User[]> {
  const where = status ? 'where status = $1' : '';
  return (await query(`select ${USER_COLS} from users ${where} order by id desc`, status ? [status] : [])).map(toUser);
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
  const app = await queryOne(
    'update dojo_applications set status = $1, admin_note = $2, reviewed_at = now() where id = $3 returning user_id',
    [status, note, id],
  );
  if (status === 'approved' && app) {
    // Approving a dojo also approves the applicant's member account.
    await query("update users set status = 'approved' where id = $1 and status = 'pending'", [app.user_id]);
  }
}

// ---------- Admin overview ----------

export async function adminCounts() {
  const r = await queryOne(`select
    (select count(*) from users where status = 'pending') as pending_users,
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

export async function findLoginUser(email: string): Promise<{ id: number; password_hash: string } | null> {
  const r = await queryOne('select id, password_hash from users where email = $1', [email]);
  return r ? { id: r.id as number, password_hash: r.password_hash as string } : null;
}
