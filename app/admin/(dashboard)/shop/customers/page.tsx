import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { listCustomers } from '@/lib/shopAdmin';
import { formatCents } from '@/lib/money';
import { Badge, Card, inputClass, primaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'Customers | Admin dashboard' };

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q } = await searchParams;
  const customers = await listCustomers(q);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-gray-900">Customers</h1>
        <form className="flex flex-wrap gap-2" action="/admin/shop/customers">
          <input name="q" defaultValue={q ?? ''} placeholder="Name, email or phone" className={`${inputClass} sm:!w-64`} />
          <button className={primaryBtn}>Search</button>
        </form>
      </div>
      <Card className="!p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Spent</th>
              <th className="p-4">Last order</th>
              <th className="p-4">Member</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="p-4">
                  <Link href={`/admin/shop/customers/${c.id}`} className="font-semibold text-red-600 hover:underline">
                    {c.name}
                  </Link>
                  <span className="block text-xs text-gray-500">{c.email}</span>
                </td>
                <td className="p-4 text-gray-600">{c.phone || '—'}</td>
                <td className="p-4">{c.orders}</td>
                <td className="p-4 font-semibold">{formatCents(c.spentCents)}</td>
                <td className="p-4 text-gray-600">{c.lastOrder ? c.lastOrder.slice(0, 10) : '—'}</td>
                <td className="p-4">
                  <Badge value={c.status} />
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
