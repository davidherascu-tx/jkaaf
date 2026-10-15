import 'server-only';
import { query, queryOne, ts } from '@/lib/db';
import { shippingSummary, type Order } from '@/lib/shop';

// Read-only reporting queries for the shop dashboard. "Revenue" counts paid and completed orders only.
const REVENUE = "status in ('paid', 'completed')";

export interface ShopStats {
  revenue: { today: number; week: number; month: number; all: number };
  orders: { total: number; awaiting: number; paid: number; completed: number; cancelled: number };
  outstandingCents: number;
  avgOrderCents: number;
  customers: number;
  lowStock: { id: number; name: string; stock: number }[];
  topProducts: { name: string; qty: number; cents: number }[];
  recent: Order[];
}

const n = (v: unknown) => Number(v ?? 0);

export async function shopStats(): Promise<ShopStats> {
  const r = (await queryOne(`select
    coalesce(sum(total_cents) filter (where ${REVENUE} and created_at >= date_trunc('day', now())), 0) as today,
    coalesce(sum(total_cents) filter (where ${REVENUE} and created_at >= now() - interval '7 days'), 0) as week,
    coalesce(sum(total_cents) filter (where ${REVENUE} and created_at >= now() - interval '30 days'), 0) as month,
    coalesce(sum(total_cents) filter (where ${REVENUE}), 0) as total,
    count(*) as orders,
    count(*) filter (where status = 'awaiting_payment') as awaiting,
    count(*) filter (where status = 'paid') as paid,
    count(*) filter (where status = 'completed') as completed,
    count(*) filter (where status = 'cancelled') as cancelled,
    coalesce(sum(total_cents) filter (where status = 'awaiting_payment'), 0) as outstanding,
    coalesce(round(avg(total_cents) filter (where status <> 'cancelled')), 0) as avg
    from orders`))!;
  const customers = n((await queryOne("select count(*) as c from users where role = 'customer'"))?.c);
  const low = await query(
    'select id, name, stock from products where active and stock is not null and stock <= 5 order by stock, name limit 8',
  );
  const top = await query(`select oi.name, sum(oi.quantity) as qty, sum(oi.unit_cents * oi.quantity) as cents
    from order_items oi join orders o on o.id = oi.order_id
    where o.status <> 'cancelled' group by oi.name order by cents desc limit 5`);
  const recent = await listOrdersAdmin({ limit: 6 });
  return {
    revenue: { today: n(r.today), week: n(r.week), month: n(r.month), all: n(r.total) },
    orders: { total: n(r.orders), awaiting: n(r.awaiting), paid: n(r.paid), completed: n(r.completed), cancelled: n(r.cancelled) },
    outstandingCents: n(r.outstanding),
    avgOrderCents: n(r.avg),
    customers,
    lowStock: low.map((p) => ({ id: n(p.id), name: p.name as string, stock: n(p.stock) })),
    topProducts: top.map((p) => ({ name: p.name as string, qty: n(p.qty), cents: n(p.cents) })),
    recent,
  };
}

/** Orders with customer info, optionally filtered by status and a search on order #, name or email. */
export async function listOrdersAdmin(opts: { status?: string; toShip?: boolean; q?: string; limit?: number } = {}): Promise<Order[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.toShip) {
    where.push(
      `o.status <> 'cancelled' and exists (select 1 from order_items x left join products p on p.id = x.product_id where x.order_id = o.id and (p.physical or x.selections::text ilike '%sticker or card%') and x.fulfillment = 'pending')`,
    );
  }
  if (opts.status) {
    params.push(opts.status);
    where.push(`o.status = $${params.length}`);
  }
  if (opts.q?.trim()) {
    const term = opts.q.trim().replace(/^#/, '');
    params.push(`%${term.toLowerCase()}%`, term);
    const like = `$${params.length - 1}`;
    const exact = `$${params.length}`;
    where.push(`(o.id::text = ${exact} or lower(u.first_name || ' ' || u.last_name) like ${like} or lower(u.email) like ${like})`);
  }
  const rows = await query(
    `select o.*, u.first_name as customer_first, u.last_name as customer_last, u.email as customer_email,
            (select count(*) from order_items x where x.order_id = o.id) as items_total,
            (select count(*) from order_items x where x.order_id = o.id and x.fulfillment <> 'pending') as items_done,
            (select count(*) from order_items x left join products p on p.id = x.product_id where x.order_id = o.id and (p.physical or x.selections::text ilike '%sticker or card%')) as ship_total,
            (select count(*) from order_items x left join products p on p.id = x.product_id where x.order_id = o.id and (p.physical or x.selections::text ilike '%sticker or card%') and x.fulfillment = 'pending') as ship_pending,
            (select count(*) from order_items x left join products p on p.id = x.product_id where x.order_id = o.id and (p.physical or x.selections::text ilike '%sticker or card%') and x.fulfillment = 'shipped') as ship_shipped
     from orders o left join users u on u.id = o.user_id
     ${where.length ? 'where ' + where.join(' and ') : ''}
     order by o.id desc ${opts.limit ? `limit ${Math.floor(opts.limit)}` : ''}`,
    params,
  );
  return rows.map(toOrder);
}

function toOrder(r: Record<string, unknown>): Order {
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
    items_total: r.items_total === undefined ? undefined : Number(r.items_total),
    items_done: r.items_done === undefined ? undefined : Number(r.items_done),
    shipping: r.ship_total === undefined ? undefined : shippingSummary(Number(r.ship_total), Number(r.ship_pending), Number(r.ship_shipped)),
  };
}

// ---------- Customers ----------

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  dojo: string;
  rank: string;
  status: string;
  created_at: string;
  orders: number;
  spentCents: number;
  lastOrder: string;
}

const CUSTOMER_SELECT = `select u.id, u.first_name, u.last_name, u.email, u.phone, u.dojo, u.rank, u.status, u.created_at,
    count(o.id) filter (where o.status <> 'cancelled') as orders,
    coalesce(sum(o.total_cents) filter (where o.status in ('paid', 'completed')), 0) as spent,
    max(o.created_at) as last_order
  from users u left join orders o on o.user_id = u.id`;

const toCustomer = (r: Record<string, unknown>): Customer => ({
  id: r.id as number,
  name: `${r.first_name} ${r.last_name}`,
  email: r.email as string,
  phone: (r.phone as string) ?? '',
  dojo: (r.dojo as string) ?? '',
  rank: (r.rank as string) ?? '',
  status: r.status as string,
  created_at: ts(r.created_at as Date),
  orders: n(r.orders),
  spentCents: n(r.spent),
  lastOrder: r.last_order ? ts(r.last_order as Date) : '',
});

export async function listCustomers(q?: string): Promise<Customer[]> {
  const params: unknown[] = [];
  let where = "where u.role = 'customer'";
  if (q?.trim()) {
    params.push(`%${q.trim().toLowerCase()}%`);
    where += ' and (lower(u.first_name || \' \' || u.last_name) like $1 or lower(u.email) like $1 or lower(u.phone) like $1)';
  }
  return (await query(`${CUSTOMER_SELECT} ${where} group by u.id order by u.id desc`, params)).map(toCustomer);
}

export async function getCustomer(id: number): Promise<{ customer: Customer; orders: Order[]; addresses: string[] } | null> {
  const r = await queryOne(`${CUSTOMER_SELECT} where u.id = $1 and u.role = 'customer' group by u.id`, [id]);
  if (!r) return null;
  const orders = (
    await query(
      `select o.*, u.first_name as customer_first, u.last_name as customer_last, u.email as customer_email
       from orders o left join users u on u.id = o.user_id where o.user_id = $1 order by o.id desc`,
      [id],
    )
  ).map(toOrder);
  // Distinct addresses used on this customer's orders, newest first.
  const seen = new Set<string>();
  const addresses: string[] = [];
  for (const o of orders) {
    if (!o.ship_address.trim()) continue;
    const a = `${o.ship_name}\n${o.ship_address}\n${o.ship_city}, ${o.ship_state} ${o.ship_zip}`;
    if (!seen.has(a.toLowerCase())) {
      seen.add(a.toLowerCase());
      addresses.push(a);
    }
  }
  return { customer: toCustomer(r), orders, addresses };
}

// ---------- Reports ----------

export interface SalesByMonth {
  month: string;
  orders: number;
  cents: number;
}

export async function salesByMonth(months = 12): Promise<SalesByMonth[]> {
  const rows = await query(
    `select to_char(date_trunc('month', created_at), 'YYYY-MM') as month, count(*) as orders, coalesce(sum(total_cents), 0) as cents
     from orders where ${REVENUE} and created_at >= date_trunc('month', now()) - ($1 || ' months')::interval
     group by 1 order by 1 desc`,
    [String(months - 1)],
  );
  return rows.map((r) => ({ month: r.month as string, orders: n(r.orders), cents: n(r.cents) }));
}

export interface SalesByProduct {
  name: string;
  qty: number;
  cents: number;
}

export async function salesByProduct(): Promise<SalesByProduct[]> {
  const rows = await query(`select oi.name, sum(oi.quantity) as qty, sum(oi.unit_cents * oi.quantity) as cents
    from order_items oi join orders o on o.id = oi.order_id
    where o.status in ('paid', 'completed') group by oi.name order by cents desc`);
  return rows.map((r) => ({ name: r.name as string, qty: n(r.qty), cents: n(r.cents) }));
}

/** One CSV row per order line, for spreadsheets / accounting. */
export async function ordersCsv(): Promise<string> {
  const rows = await query(`select o.id, o.created_at, o.status, u.first_name, u.last_name, u.email,
      o.ship_name, o.ship_address, o.ship_city, o.ship_state, o.ship_zip,
      oi.name as item, oi.quantity, oi.unit_cents, o.total_cents, o.notes
    from orders o left join users u on u.id = o.user_id left join order_items oi on oi.order_id = o.id
    order by o.id desc, oi.id`);
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ['order', 'date', 'status', 'first_name', 'last_name', 'email', 'ship_name', 'address', 'city', 'state', 'zip', 'item', 'qty', 'unit_price', 'order_total', 'notes'];
  const lines = rows.map((r) =>
    [
      r.id,
      ts(r.created_at as Date),
      r.status,
      r.first_name,
      r.last_name,
      r.email,
      r.ship_name,
      r.ship_address,
      r.ship_city,
      r.ship_state,
      r.ship_zip,
      r.item,
      r.quantity,
      r.unit_cents != null ? (n(r.unit_cents) / 100).toFixed(2) : '',
      (n(r.total_cents) / 100).toFixed(2),
      r.notes,
    ]
      .map(esc)
      .join(','),
  );
  return [head.join(','), ...lines].join('\n');
}
