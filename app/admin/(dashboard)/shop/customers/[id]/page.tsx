import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ORDER_STATUS_LABEL } from '@/lib/shop';
import { getCustomer } from '@/lib/shopAdmin';
import { formatCents } from '@/lib/money';
import { Badge, Card } from '@/components/shop/ui';
import ResetPassword from './ResetPassword';

export const metadata = { title: 'Customer | Admin dashboard' };

export default async function AdminCustomer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = /^\d+$/.test(id) ? await getCustomer(Number(id)) : null;
  if (!found) notFound();
  const { customer: c, orders, addresses } = found;

  return (
    <div className="space-y-6">
      <Link href="/admin/shop/customers" className="text-sm font-semibold text-gray-600 hover:text-red-600">
        ← All customers
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold text-gray-900">{c.name}</h1>
        <Badge value={c.status} label={`Member: ${c.status}`} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="!p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Orders</p>
          <p className="mt-1 text-3xl font-extrabold">{c.orders}</p>
        </Card>
        <Card className="!p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total spent</p>
          <p className="mt-1 text-3xl font-extrabold">{formatCents(c.spentCents)}</p>
        </Card>
        <Card className="!p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Customer since</p>
          <p className="mt-1 text-xl font-extrabold">{c.created_at.slice(0, 10)}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="!p-5">
          <h2 className="font-bold text-gray-900 mb-3">Contact</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-semibold break-all text-right">
                <a href={`mailto:${c.email}`} className="hover:text-red-600">
                  {c.email}
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-semibold">{c.phone || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Dojo / club</dt>
              <dd className="font-semibold text-right">{c.dojo || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Rank</dt>
              <dd className="font-semibold">{c.rank || '—'}</dd>
            </div>
          </dl>
        </Card>

        <Card className="!p-5">
          <h2 className="font-bold text-gray-900 mb-3">Addresses</h2>
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500">No address yet. Addresses appear here once the customer orders something that ships.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {addresses.map((a) => (
                <li key={a} className="whitespace-pre-line rounded-lg bg-gray-50 px-3 py-2">
                  {a}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="!p-5">
        <h2 className="font-bold text-gray-900 mb-1">Password</h2>
        <p className="text-sm text-gray-600 mb-4">
          You cannot see a customer&apos;s password. Send them a link so they can choose a new one themselves.
        </p>
        <ResetPassword userId={c.id} />
      </Card>

      <Card className="!p-0 overflow-x-auto">
        <h2 className="font-bold text-gray-900 p-5 pb-3">Orders</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-y border-gray-200">
            <tr>
              <th className="p-4">Order</th>
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
                <td className="p-4 text-gray-600">{o.created_at}</td>
                <td className="p-4 font-semibold">{formatCents(o.total_cents)}</td>
                <td className="p-4">
                  <Badge value={o.status} label={ORDER_STATUS_LABEL[o.status]} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="p-5 text-gray-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
