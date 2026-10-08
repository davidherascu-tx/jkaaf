import 'server-only';
import { db, tx } from '@/lib/db';
import type { User } from '@/lib/auth';
import { currentPriceCents, type Product, type ProductInput, type ProductOption } from '@/lib/products';

// ---------- Products ----------

export { isOnSale, currentPriceCents } from '@/lib/products';
export type { Choice, Product, ProductInput, ProductOption } from '@/lib/products';

type Row = Record<string, unknown>;

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
    free_shipping: r.free_shipping === undefined ? true : !!r.free_shipping,
    options: JSON.parse(r.options_json as string) as ProductOption[],
    physical: !!r.physical,
    requires_dojo_approval: !!r.requires_dojo_approval,
    active: !!r.active,
    sort: r.sort as number,
  };
}

export function listProducts(includeInactive = false): Product[] {
  const rows = db()
    .prepare(`SELECT * FROM products ${includeInactive ? '' : 'WHERE active = 1'} ORDER BY sort, id`)
    .all();
  return rows.map(toProduct);
}

export function getProductBySlug(slug: string): Product | null {
  const r = db().prepare('SELECT * FROM products WHERE slug = ?').get(slug);
  return r ? toProduct(r) : null;
}

export function getProductById(id: number): Product | null {
  const r = db().prepare('SELECT * FROM products WHERE id = ?').get(id);
  return r ? toProduct(r) : null;
}

export function saveProduct(id: number | null, p: ProductInput): number {
  const args = [
    p.name,
    p.slug,
    p.description,
    p.price_cents,
    p.price_note,
    p.image_url,
    p.sale_price_cents,
    p.sale_ends_on,
    p.stock,
    p.free_shipping ? 1 : 0,
    JSON.stringify(p.options),
    p.physical ? 1 : 0,
    p.requires_dojo_approval ? 1 : 0,
    p.active ? 1 : 0,
    p.sort,
  ];
  if (id === null) {
    const r = db()
      .prepare(
        `INSERT INTO products (name, slug, description, price_cents, price_note, image_url, sale_price_cents, sale_ends_on, stock, free_shipping, options_json, physical, requires_dojo_approval, active, sort)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(...(args as []));
    return Number(r.lastInsertRowid);
  }
  db()
    .prepare(
      `UPDATE products SET name=?, slug=?, description=?, price_cents=?, price_note=?, image_url=?, sale_price_cents=?, sale_ends_on=?, stock=?, free_shipping=?, options_json=?,
       physical=?, requires_dojo_approval=?, active=?, sort=? WHERE id=?`,
    )
    .run(...(args as []), id);
  return id;
}

export function deleteProduct(id: number) {
  const used = db().prepare('SELECT 1 FROM order_items WHERE product_id = ? LIMIT 1').get(id);
  if (used) {
    // Keep order history intact: hide instead of delete.
    db().prepare('UPDATE products SET active = 0 WHERE id = ?').run(id);
    return 'archived' as const;
  }
  db().prepare('DELETE FROM products WHERE id = ?').run(id);
  return 'deleted' as const;
}

export function setStock(id: number, stock: number | null) {
  db().prepare('UPDATE products SET stock = ? WHERE id = ?').run(stock, id);
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

export function approvedClubNames(userId: number): string[] {
  return db()
    .prepare("SELECT dojo_name FROM dojo_applications WHERE user_id = ? AND status = 'approved' ORDER BY dojo_name")
    .all(userId)
    .map((r) => r.dojo_name as string);
}

// ---------- Cart ----------

/** A cart belongs to a signed-in user or, for guests, to a cookie token. */
export type CartOwner = { userId: number; token?: undefined } | { userId?: undefined; token: string };

const ownerWhere = (o: CartOwner): [string, string | number] =>
  o.userId !== undefined ? ['user_id = ?', o.userId] : ['cart_token = ?', o.token];

export interface CartLine {
  id: number;
  product: Product;
  selections: Selections;
  quantity: number;
  priced: PricedLine | { error: string };
}

/** Units of a product already in this cart, excluding one line. */
function inCart(owner: CartOwner, productId: number, exceptItemId = 0): number {
  const [where, arg] = ownerWhere(owner);
  const r = db()
    .prepare(`SELECT COALESCE(SUM(quantity), 0) AS n FROM cart_items WHERE ${where} AND product_id = ? AND id != ?`)
    .get(arg, productId, exceptItemId);
  return Number(r?.n ?? 0);
}

/** Message if `quantity` more units cannot be supplied from stock, otherwise null. */
function stockProblem(product: Product, owner: CartOwner, quantity: number, exceptItemId = 0): string | null {
  if (product.stock === null) return null;
  if (product.stock <= 0) return `${product.name} is out of stock.`;
  if (inCart(owner, product.id, exceptItemId) + quantity > product.stock) {
    return `Only ${product.stock} of ${product.name} in stock.`;
  }
  return null;
}

export function getCart(owner: CartOwner): CartLine[] {
  const clubs = owner.userId ? approvedClubNames(owner.userId) : [];
  const [where, arg] = ownerWhere(owner);
  const rows = db().prepare(`SELECT * FROM cart_items WHERE ${where} ORDER BY id`).all(arg);
  const lines: CartLine[] = [];
  for (const r of rows) {
    const product = getProductById(r.product_id as number);
    if (!product || !product.active) {
      db().prepare('DELETE FROM cart_items WHERE id = ?').run(r.id);
      continue;
    }
    const selections = JSON.parse(r.selections_json as string) as Selections;
    const stockErr = stockProblem(product, owner, r.quantity as number, r.id as number);
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

export function cartCount(owner: CartOwner): number {
  const [where, arg] = ownerWhere(owner);
  const r = db().prepare(`SELECT COALESCE(SUM(quantity), 0) AS n FROM cart_items WHERE ${where}`).get(arg);
  return Number(r?.n ?? 0);
}

export function addToCart(owner: CartOwner, product: Product, selections: Selections, quantity: number): string | null {
  const clubs = owner.userId ? approvedClubNames(owner.userId) : [];
  const priced = priceItem(product, selections, clubs);
  if ('error' in priced) return priced.error;
  const stockErr = stockProblem(product, owner, quantity);
  if (stockErr) return stockErr;
  const json = JSON.stringify(selections);
  const [where, arg] = ownerWhere(owner);
  const existing = db()
    .prepare(`SELECT id FROM cart_items WHERE ${where} AND product_id = ? AND selections_json = ?`)
    .get(arg, product.id, json);
  if (existing) {
    db().prepare('UPDATE cart_items SET quantity = MIN(quantity + ?, 99) WHERE id = ?').run(quantity, existing.id);
  } else {
    db()
      .prepare('INSERT INTO cart_items (user_id, cart_token, product_id, selections_json, quantity) VALUES (?, ?, ?, ?, ?)')
      .run(owner.userId ?? null, owner.token ?? null, product.id, json, quantity);
  }
  return null;
}

export function setCartQuantity(owner: CartOwner, itemId: number, quantity: number) {
  const [where, arg] = ownerWhere(owner);
  if (quantity <= 0) db().prepare(`DELETE FROM cart_items WHERE id = ? AND ${where}`).run(itemId, arg);
  else db().prepare(`UPDATE cart_items SET quantity = ? WHERE id = ? AND ${where}`).run(Math.min(quantity, 99), itemId, arg);
}

/** Move a guest cart into a user's cart (called after sign in / sign up). */
export function mergeGuestCart(token: string, userId: number) {
  tx(() => {
    const rows = db().prepare('SELECT * FROM cart_items WHERE cart_token = ?').all(token);
    for (const r of rows) {
      const existing = db()
        .prepare('SELECT id FROM cart_items WHERE user_id = ? AND product_id = ? AND selections_json = ?')
        .get(userId, r.product_id, r.selections_json);
      if (existing) {
        db().prepare('UPDATE cart_items SET quantity = MIN(quantity + ?, 99) WHERE id = ?').run(r.quantity, existing.id);
        db().prepare('DELETE FROM cart_items WHERE id = ?').run(r.id);
      } else {
        db().prepare('UPDATE cart_items SET user_id = ?, cart_token = NULL WHERE id = ?').run(userId, r.id);
      }
    }
  });
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

export function placeOrder(user: User, ship: ShippingInfo, notes: string): { orderId: number } | { error: string } {
  const cart = getCart({ userId: user.id });
  if (cart.length === 0) return { error: 'Your cart is empty.' };
  let total = 0;
  for (const l of cart) {
    if ('error' in l.priced) return { error: `${l.product.name}: ${l.priced.error}` };
    total += l.priced.unitCents * l.quantity;
  }
  let orderId: number;
  try {
    orderId = tx(() => {
    // Re-check and take stock inside the transaction so two buyers cannot oversell.
    const wanted = new Map<number, number>();
    for (const l of cart) wanted.set(l.product.id, (wanted.get(l.product.id) ?? 0) + l.quantity);
    for (const [pid, qty] of wanted) {
      const p = getProductById(pid);
      if (p && p.stock !== null) {
        if (p.stock < qty) throw new Error(`Only ${Math.max(p.stock, 0)} of ${p.name} left in stock.`);
        db().prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(qty, pid);
      }
    }
    const r = db()
      .prepare(
        `INSERT INTO orders (user_id, total_cents, ship_name, ship_address, ship_city, ship_state, ship_zip, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(user.id, total, ship.name, ship.address, ship.city, ship.state, ship.zip, notes);
    const id = Number(r.lastInsertRowid);
    const ins = db().prepare(
      `INSERT INTO order_items (order_id, product_id, name, unit_cents, quantity, selections_json, recurring, free_shipping)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const l of cart) {
      const p = l.priced as PricedLine;
      ins.run(id, l.product.id, l.product.name, p.unitCents, l.quantity, JSON.stringify(p.lines), p.recurring ? 1 : 0, l.product.free_shipping ? 1 : 0);
    }
    db().prepare('DELETE FROM cart_items WHERE user_id = ?').run(user.id);
    return id;
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not place the order.' };
  }
  return { orderId };
}

const ORDER_SELECT = `SELECT o.*, u.first_name || ' ' || u.last_name AS customer_name, u.email AS customer_email
  FROM orders o JOIN users u ON u.id = o.user_id`;

export function listOrders(userId?: number): Order[] {
  const rows = userId
    ? db().prepare(`${ORDER_SELECT} WHERE o.user_id = ? ORDER BY o.id DESC`).all(userId)
    : db().prepare(`${ORDER_SELECT} ORDER BY o.id DESC`).all();
  return rows as unknown as Order[];
}

export function getOrder(id: number): { order: Order; items: OrderItem[] } | null {
  const o = db().prepare(`${ORDER_SELECT} WHERE o.id = ?`).get(id);
  if (!o) return null;
  const items = db()
    .prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id')
    .all(id)
    .map((r) => ({
      id: r.id as number,
      name: r.name as string,
      unit_cents: r.unit_cents as number,
      quantity: r.quantity as number,
      selections: JSON.parse(r.selections_json as string),
      recurring: !!r.recurring,
      free_shipping: r.free_shipping === undefined ? true : !!r.free_shipping,
    }));
  return { order: o as unknown as Order, items };
}

export const ORDER_STATUSES = ['awaiting_payment', 'paid', 'completed', 'cancelled'] as const;
export const ORDER_STATUS_LABEL: Record<Order['status'], string> = {
  awaiting_payment: 'Awaiting check',
  paid: 'Paid',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** Changing status also keeps stock right: cancelling returns items to stock, reopening takes them again. */
export function setOrderStatus(id: number, status: Order['status']) {
  tx(() => {
    const row = db().prepare('SELECT status FROM orders WHERE id = ?').get(id);
    if (!row) return;
    const was = row.status as Order['status'];
    if (was !== status && (was === 'cancelled' || status === 'cancelled')) {
      const sign = status === 'cancelled' ? 1 : -1;
      const items = db().prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(id);
      for (const it of items) {
        db()
          .prepare('UPDATE products SET stock = MAX(stock + ?, 0) WHERE id = ? AND stock IS NOT NULL')
          .run(sign * (it.quantity as number), it.product_id);
      }
    }
    db().prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  });
}

// ---------- Members ----------

export function listUsers(status?: string): User[] {
  const rows = status
    ? db().prepare('SELECT id, email, first_name, last_name, phone, dojo, rank, role, status, created_at FROM users WHERE status = ? ORDER BY id DESC').all(status)
    : db().prepare('SELECT id, email, first_name, last_name, phone, dojo, rank, role, status, created_at FROM users ORDER BY id DESC').all();
  return rows as unknown as User[];
}

export function setUserStatus(id: number, status: User['status']) {
  db().prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
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
    data: JSON.parse(r.data_json as string),
    signature: r.signature as string,
    admin_note: r.admin_note as string,
    created_at: r.created_at as string,
    reviewed_at: (r.reviewed_at as string) ?? null,
    applicant_email: r.applicant_email as string | undefined,
  };
}

export function createApplication(userId: number, data: Record<string, string>, signature: string) {
  const r = db()
    .prepare('INSERT INTO dojo_applications (user_id, dojo_name, chief_instructor, data_json, signature) VALUES (?, ?, ?, ?, ?)')
    .run(userId, data.dojo_name, data.chief_instructor, JSON.stringify(data), signature);
  return Number(r.lastInsertRowid);
}

const APP_SELECT = `SELECT a.*, u.email AS applicant_email FROM dojo_applications a JOIN users u ON u.id = a.user_id`;

export function listApplications(userId?: number): DojoApplication[] {
  const rows = userId
    ? db().prepare(`${APP_SELECT} WHERE a.user_id = ? ORDER BY a.id DESC`).all(userId)
    : db().prepare(`${APP_SELECT} ORDER BY (a.status = 'pending') DESC, a.id DESC`).all();
  return rows.map(toApplication);
}

export function getApplication(id: number): DojoApplication | null {
  const r = db().prepare(`${APP_SELECT} WHERE a.id = ?`).get(id);
  return r ? toApplication(r) : null;
}

export function reviewApplication(id: number, status: 'approved' | 'rejected', note: string) {
  db()
    .prepare("UPDATE dojo_applications SET status = ?, admin_note = ?, reviewed_at = datetime('now') WHERE id = ?")
    .run(status, note, id);
  if (status === 'approved') {
    // Approving a dojo also approves the applicant's member account.
    db()
      .prepare("UPDATE users SET status = 'approved' WHERE status = 'pending' AND id = (SELECT user_id FROM dojo_applications WHERE id = ?)")
      .run(id);
  }
}
