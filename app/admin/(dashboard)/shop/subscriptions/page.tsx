import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { listSubscriptions } from '@/lib/shop';
import { dateOnlyText, isExpired, timeLeftText, validThroughText } from '@/lib/membership';
import { Badge, Card } from '@/components/shop/ui';

export const metadata = { title: 'Subscriptions | Admin dashboard' };

type Filter = 'all' | 'active' | 'canceled';

export default async function AdminSubscriptions({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireAdmin();
  const { show } = await searchParams;
  const filter: Filter = show === 'active' || show === 'canceled' ? show : 'all';
  const all = await listSubscriptions();
  const rows = all.filter((r) => (filter === 'all' ? true : filter === 'canceled' ? !!r.canceled_at : !r.canceled_at));
  const canceledCount = all.filter((r) => r.canceled_at).length;

  const tab = (value: Filter, label: string) => (
    <Link
      key={value}
      href={value === 'all' ? '/admin/shop/subscriptions' : { pathname: '/admin/shop/subscriptions', query: { show: value } }}
      className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
        filter === value ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-red-400 hover:text-red-600'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Subscriptions</h1>
        <p className="text-gray-600 mt-1">
          Yearly subscriptions and who canceled. A membership is paid for the whole calendar year, so a canceled member stays active until December 31.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tab('all', `All (${all.length})`)}
        {tab('active', `Renewing (${all.length - canceledCount})`)}
        {tab('canceled', `Canceled (${canceledCount})`)}
      </div>

      <Card className="!p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Subscription</th>
              <th className="p-4">Subscription status</th>
              <th className="p-4">Canceled on</th>
              <th className="p-4">Membership valid until</th>
              <th className="p-4">Time left</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => {
              const paid = r.order_status === 'paid' || r.order_status === 'completed';
              return (
                <tr key={r.item_id}>
                  <td className="p-4">
                    <Link href={`/admin/shop/customers/${r.user_id}`} className="font-semibold text-gray-900 hover:text-red-600">
                      {r.customer || r.email}
                    </Link>
                    <span className="block text-xs text-gray-500">{r.email}</span>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/shop/orders/${r.order_id}`} className="font-semibold text-red-600 hover:underline">
                      Order #{r.order_id}
                    </Link>
                    <span className="block text-xs text-gray-500">
                      {r.product} · {r.year}
                      {!paid && ' · not paid yet'}
                    </span>
                  </td>
                  <td className="p-4">
                    {r.canceled_at ? <Badge value="cancelled" label="Canceled" /> : <Badge value="approved" label="Renewing" />}
                  </td>
                  <td className="p-4 text-gray-700">{r.canceled_at ? dateOnlyText(r.canceled_at) : '—'}</td>
                  <td className="p-4 text-gray-700">{validThroughText(r.year)}</td>
                  <td className={`p-4 font-semibold ${isExpired(r.year) ? 'text-gray-500' : 'text-green-700'}`}>{timeLeftText(r.year)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-gray-500">
                  No subscriptions here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
