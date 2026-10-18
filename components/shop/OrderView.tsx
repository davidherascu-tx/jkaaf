import { formatCents, shippingText } from '@/lib/money';
import { fulfillmentLabel, ORDER_STATUS_LABEL, type Order, type OrderItem } from '@/lib/shop';
import { Badge, Card } from '@/components/shop/ui';
import { METHOD_SHORT } from '@/lib/payments/config';
import { dateOnlyText, isExpired, membershipYear, timeLeftText, validThroughText } from '@/lib/membership';
import TrackingInfo from '@/components/shop/TrackingInfo';

export default function OrderView({ order, items }: { order: Order; items: OrderItem[] }) {
  const hasShipping = !!order.ship_address;
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
          <p className="text-sm text-gray-500">{order.created_at} UTC · Payment by {METHOD_SHORT[order.payment_method] ?? order.payment_method}{order.card_label ? ` (${order.card_label})` : ''}</p>
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
              {i.recurring &&
                (i.subscription_canceled_at ? (
                  <p className="text-sm font-semibold text-gray-600">
                    Subscription canceled {dateOnlyText(i.subscription_canceled_at)} · membership valid through {validThroughText(membershipYear(order.created_at))}
                    {isExpired(membershipYear(order.created_at)) ? ' (expired)' : ` (${timeLeftText(membershipYear(order.created_at))})`}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-amber-700">Renews yearly until canceled</p>
                ))}
              {order.status !== 'cancelled' && (
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <Badge
                    value={i.fulfillment === 'pending' ? 'pending' : i.fulfillment === 'shipped' ? 'completed' : 'approved'}
                    label={fulfillmentLabel(i.fulfillment, i.physical)}
                  />
                  <TrackingInfo carrier={i.carrier} tracking={i.tracking} />
                </p>
              )}
            </div>
            <p className="font-semibold">{formatCents((i.unit_cents - i.ship_cents) * i.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-200 pt-3 mt-1 space-y-1">
        <div className="flex justify-between text-sm text-gray-700">
          <span>Shipping</span>
          {(() => {
            const ship = items.reduce((n, i) => n + i.ship_cents * i.quantity, 0);
            const free = ship === 0 && items.every((i) => i.free_shipping);
            return <span className={`font-semibold ${free ? 'text-green-700' : 'text-gray-700'}`}>{shippingText(ship, items.every((i) => i.free_shipping))}</span>;
          })()}
        </div>
        {!!order.refunded_cents && (
          <div className="flex justify-between text-sm font-semibold text-gray-700">
            <span>Refunded</span>
            <span>-{formatCents(order.refunded_cents)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-extrabold">
          <span>Total</span>
          <span>{formatCents(order.total_cents)}</span>
        </div>
      </div>
      {hasShipping && (
        <div className="mt-5 text-sm text-gray-700">
          <p className="font-bold text-gray-900">Address</p>
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
