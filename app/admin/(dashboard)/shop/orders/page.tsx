import Link from 'next/link';
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from '@/lib/shop';
import { listOrdersAdmin } from '@/lib/shopAdmin';
import { formatCents } from '@/lib/money';
import { Badge, Card, inputClass, primaryBtn, secondaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'Orders | Dashboard' };

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const valid = (ORDER_STATUSES as readonly string[]).includes(status ?? '') ? status : undefined;
  const orders = await listOrdersAdmin({ status: valid, q });
  const tab = (value: string | undefined, label: string) => (
    <Link
      key={label}
      href={{ pathname: '/admin/shop/orders', query: { ...(value ? { status: value } : {}), ...(q ? { q } : {}) } }}
      className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
        valid === value ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-red-400 hover:text-red-600'
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-gray-900">Orders</h1>
        <a href="/admin/shop/export" className={secondaryBtn}>
          Export CSV
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tab(undefined, 'All')}
          {ORDER_STATUSES.map((s) => tab(s, ORDER_STATUS_LABEL[s]))}
        </div>
        <form className="flex gap-2" action="/admin/shop/orders">
          {valid && <input type="hidden" name="status" value={valid} />}
          <input name="q" defaultValue={q ?? ''} placeholder="Order #, name or email" className={`${inputClass} !w-64`} />
          <button className={primaryBtn}>Search</button>
        </form>
      </div>

      <Card className="!p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date (UTC)</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="p-4">
                  <Link href={`/admin/shop/orders/${o.id}`} className="font-semibold text-red-600 hover:underline">
                    #{o.id}
                  </Link>
                </td>
                <td className="p-4">
                  <Link href={`/admin/shop/customers/${o.user_id}`} className="hover:text-red-600">
                    {o.customer_name}
                  </Link>
                  <span className="block text-xs text-gray-500">{o.customer_email}</span>
                </td>
                <td className="p-4 text-gray-600">{o.created_at}</td>
                <td className="p-4 font-semibold">{formatCents(o.total_cents)}</td>
                <td className="p-4">
                  <Badge value={o.status} label={ORDER_STATUS_LABEL[o.status]} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
