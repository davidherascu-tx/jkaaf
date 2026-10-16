import { listPayments, listRefunds } from '@/lib/payments';
import { METHOD_LABEL } from '@/lib/payments/config';
import { formatCents } from '@/lib/money';
import type { Order } from '@/lib/shop';
import RefundForm from '@/components/admin/RefundForm';
import { Card } from '@/components/shop/ui';

/** Payments received for an order, refunds already sent, and the Send refund button. Renders nothing for unpaid orders. */
export default async function PaymentsCard({ order }: { order: Order }) {
  const [payments, refunds] = await Promise.all([listPayments(order.id), listRefunds(order.id)]);
  if (payments.length === 0) return null;
  const cancelled = order.status === 'cancelled';
  const refundable = payments.reduce((s, p) => s + (p.amount_cents - p.refunded_cents), 0);

  return (
    <Card className={`!p-5 ${cancelled && refundable > 0 ? '!border-red-300' : ''}`}>
      <h2 className="font-bold text-gray-900 mb-1">Payments &amp; refunds</h2>
      {cancelled && refundable > 0 && (
        <p className="text-sm font-semibold text-red-700 mb-3">
          This order is cancelled and {formatCents(refundable)} is still paid. Send the customer a refund.
        </p>
      )}
      <ul className="divide-y divide-gray-100">
        {payments.map((p) => {
          const remaining = p.amount_cents - p.refunded_cents;
          return (
            <li key={p.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="font-semibold text-gray-900">
                  {METHOD_LABEL[p.provider] ?? p.provider} · {formatCents(p.amount_cents)}
                  <span className="ml-2 font-normal text-gray-500">{p.created_at} UTC</span>
                </p>
                <p className="text-gray-600">
                  {p.refunded_cents > 0 && <>Refunded {formatCents(p.refunded_cents)} · </>}
                  {remaining > 0 ? `${formatCents(remaining)} left to refund` : 'Fully refunded'}
                </p>
              </div>
              {p.provider_ref && <p className="text-xs text-gray-400 break-all">Reference: {p.provider_ref}</p>}
              {remaining > 0 && (
                <RefundForm orderId={order.id} paymentId={p.id} remainingCents={remaining} provider={p.provider} highlight={cancelled} />
              )}
            </li>
          );
        })}
      </ul>

      {refunds.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Refunds sent</p>
          <ul className="space-y-1 text-sm text-gray-700">
            {refunds.map((r) => (
              <li key={r.id}>
                {formatCents(r.amount_cents)} via {METHOD_LABEL[r.provider] ?? r.provider} · {r.created_at} UTC
                {r.reason && <span className="text-gray-500"> · {r.reason}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
