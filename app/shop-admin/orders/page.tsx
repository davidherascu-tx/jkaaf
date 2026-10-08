import Link from 'next/link';
import { listOrders, ORDER_STATUS_LABEL } from '@/lib/shop';
import { formatCents } from '@/lib/money';
import { Badge, Card } from '@/components/shop/ui';

export default function AdminOrders() {
  const orders = listOrders();
  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Orders</h1>
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
                  <Link href={`/shop-admin/orders/${o.id}`} className="font-semibold text-red-600 hover:underline">
                    #{o.id}
                  </Link>
                </td>
                <td className="p-4">
                  {o.customer_name}
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
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
