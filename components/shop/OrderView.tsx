import { formatCents } from '@/lib/money';
import { ORDER_STATUS_LABEL, type Order, type OrderItem } from '@/lib/shop';
import { Badge, Card } from '@/components/shop/ui';

export default function OrderView({ order, items }: { order: Order; items: OrderItem[] }) {
  const hasShipping = !!order.ship_address;
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
          <p className="text-sm text-gray-500">{order.created_at} UTC · Payment by check</p>
        </div>
        <Badge value={order.status} label={ORDER_STATUS_LABEL[order.status]} />
      </div>
      <ul className="divide-y divide-gray-100">
        {items.map((i) => (
          <li key={i.id} className="py-3 flex justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">
                {i.quantity} × {i.name}
              </p>
              {i.selections.map((s) => (
                <p key={s.label} className="text-sm text-gray-600">
                  {s.label}: {s.value}
                </p>
              ))}
              {i.recurring && <p className="text-sm font-semibold text-amber-700">Renews yearly until canceled</p>}
            </div>
            <p className="font-semibold">{formatCents(i.unit_cents * i.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-200 pt-3 mt-1 space-y-1">
        <div className="flex justify-between text-sm text-gray-700">
          <span>Shipping</span>
          {items.every((i) => i.free_shipping) ? (
              <span className="font-semibold text-green-700">Free</span>
            ) : (
              <span className="font-semibold text-gray-700">Included in item prices</span>
            )}
        </div>
        <div className="flex justify-between text-lg font-extrabold">
          <span>Total</span>
          <span>{formatCents(order.total_cents)}</span>
        </div>
      </div>
      {hasShipping && (
        <div className="mt-5 text-sm text-gray-700">
          <p className="font-bold text-gray-900">Ship to</p>
          <p>{order.ship_name}</p>
          <p>{order.ship_address}</p>
          <p>
            {order.ship_city}, {order.ship_state} {order.ship_zip}
          </p>
        </div>
      )}
      {order.notes && (
        <p className="mt-4 text-sm text-gray-700">
          <span className="font-bold text-gray-900">Notes: </span>
          {order.notes}
        </p>
      )}
    </Card>
  );
}
