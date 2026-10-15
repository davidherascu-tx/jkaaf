import { salesByMonth, salesByProduct } from '@/lib/shopAdmin';
import { formatCents } from '@/lib/money';
import { Card, secondaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'Reports | Admin dashboard' };

const monthLabel = (m: string) => new Date(`${m}-01T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default async function AdminReports() {
  const [months, products] = await Promise.all([salesByMonth(12), salesByProduct()]);
  const max = Math.max(1, ...months.map((m) => m.cents));
  const total = months.reduce((s, m) => s + m.cents, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-600 mt-1">Only orders marked Paid or Completed count as sales.</p>
        </div>
        <a href="/admin/shop/export" className={secondaryBtn}>
          Export all orders (CSV)
        </a>
      </div>

      <Card className="!p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-bold text-gray-900">Sales by month (last 12 months)</h2>
          <span className="text-sm font-semibold text-gray-700">{formatCents(total)}</span>
        </div>
        {months.length === 0 ? (
          <p className="text-sm text-gray-500">No paid orders yet.</p>
        ) : (
          <ul className="space-y-3">
            {months.map((m) => (
              <li key={m.month} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-gray-800">{monthLabel(m.month)}</span>
                  <span className="text-gray-700">
                    {formatCents(m.cents)} <span className="text-gray-400">· {m.orders} {m.orders === 1 ? 'order' : 'orders'}</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-red-600" style={{ width: `${Math.max(2, (m.cents / max) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="!p-0 overflow-x-auto">
        <h2 className="font-bold text-gray-900 p-5 pb-3">Sales by product</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-y border-gray-200">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Units sold</th>
              <th className="p-4 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.name}>
                <td className="p-4 font-semibold text-gray-900">{p.name}</td>
                <td className="p-4">{p.qty}</td>
                <td className="p-4 text-right font-semibold">{formatCents(p.cents)}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={3} className="p-5 text-gray-500">
                  No paid orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
