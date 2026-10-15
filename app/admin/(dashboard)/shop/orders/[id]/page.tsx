import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import {
  resendInvoiceAction,
  setItemFulfillmentAction,
  setOrderStatusAction,
  setPaymentAction,
  updateOrderShippingAction,
} from '@/app/admin/actions';
import { CARRIERS } from '@/lib/carriers';
import StateInput from '@/components/shop/StateInput';
import TrackingInfo from '@/components/shop/TrackingInfo';
import { getUserById } from '@/lib/auth';
import { fulfillmentLabel, FULFILLMENT_STATUSES, getOrder, ORDER_STATUS_LABEL } from '@/lib/shop';
import OrderView from '@/components/shop/OrderView';
import { Badge, Card, inputClass, primaryBtn, secondaryBtn } from '@/components/shop/ui';

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const found = /^\d+$/.test(id) ? await getOrder(Number(id)) : null;
  if (!found) notFound();
  const { order, items } = found;
  const member = await getUserById(order.user_id);
  const cancelled = order.status === 'cancelled';
  const paymentReceived = order.status === 'paid' || order.status === 'completed';

  return (
    <div className="space-y-5">
      <Link href="/admin/shop/orders" className="text-sm font-semibold text-gray-600 hover:text-red-600">
        ← All orders
      </Link>

      <Card className="!p-5 space-y-4">
        <p className="text-sm text-gray-700">
          Customer:{' '}
          <Link href={`/admin/shop/customers/${order.user_id}`} className="font-bold hover:text-red-600">
            {order.customer_name}
          </Link>{' '}
          ({order.customer_email}) · JKA/AF membership: {member && <Badge value={member.status} />}
          {member?.status === 'pending' && (
            <Link href="/admin/dojo/members" className="ml-2 font-semibold text-red-600 hover:underline">
              Review
            </Link>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-gray-900 w-24">Order</span>
          <Badge value={order.status} label={ORDER_STATUS_LABEL[order.status]} />
          <div className="flex gap-2 ml-auto">
            {cancelled ? (
              <form action={setOrderStatusAction.bind(null, order.id, 'awaiting_payment')}>
                <button className={`${secondaryBtn} !py-1.5 text-sm`}>Reopen order</button>
              </form>
            ) : (
              <form action={setOrderStatusAction.bind(null, order.id, 'cancelled')}>
                <button className="px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 cursor-pointer">
                  Cancel order
                </button>
              </form>
            )}
            <form action={resendInvoiceAction.bind(null, order.id)}>
              <button className={`${secondaryBtn} !py-1.5 text-sm`}>Resend invoice email</button>
            </form>
            <a href={`/shop/orders/${order.id}/invoice`} className={`${secondaryBtn} !py-1.5 text-sm`}>
              Download invoice (PDF)
            </a>
          </div>
        </div>

        {!cancelled && (
          <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
            <span className="text-sm font-bold text-gray-900 w-24">Payment</span>
            <Badge value={paymentReceived ? 'paid' : 'awaiting_payment'} label={paymentReceived ? 'Payment received' : 'Awaiting check'} />
            <form action={setPaymentAction.bind(null, order.id, !paymentReceived)} className="ml-auto">
              <button className={paymentReceived ? `${secondaryBtn} !py-1.5 text-sm` : `${primaryBtn} !py-1.5 !px-4 text-sm`}>
                {paymentReceived ? 'Mark as not received' : 'Mark payment received'}
              </button>
            </form>
          </div>
        )}
      </Card>

      {!cancelled && (
        <Card className="!p-5">
          <h2 className="font-bold text-gray-900 mb-1">Shipping &amp; fulfillment</h2>
          <p className="text-sm text-gray-500 mb-4">
            Update each item on its own: set the status, the shipping provider and the tracking number. Once payment is received and every
            item is shipped (or completed), the order is marked Completed automatically.
          </p>
          {items.some((i) => i.physical) && (
            <div className="mb-5 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-gray-900">Ship to</p>
              </div>
              {order.ship_address ? (
                <>
                  <p>{order.ship_name}</p>
                  <p>{order.ship_address}</p>
                  <p>
                    {order.ship_city}, {order.ship_state} {order.ship_zip}
                  </p>
                </>
              ) : (
                <p className="text-amber-700">No shipping address on this order yet. Add one below.</p>
              )}
              <details className="mt-3">
                <summary className="cursor-pointer font-semibold text-red-600">{order.ship_address ? 'Edit shipping address' : 'Add shipping address'}</summary>
                <form action={updateOrderShippingAction.bind(null, order.id)} className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input name="name" defaultValue={order.ship_name} placeholder="Full name" required className={`${inputClass} !py-1.5 text-sm sm:col-span-2`} />
                  <input name="address" defaultValue={order.ship_address} placeholder="Street address" required className={`${inputClass} !py-1.5 text-sm sm:col-span-2`} />
                  <input name="city" defaultValue={order.ship_city} placeholder="City" required className={`${inputClass} !py-1.5 text-sm`} />
                  <div className="flex gap-2">
                    <StateInput name="state" defaultValue={order.ship_state} placeholder="State" required className={`${inputClass} !py-1.5 text-sm`} />
                    <input name="zip" defaultValue={order.ship_zip} placeholder="Zip" required className={`${inputClass} !py-1.5 text-sm`} />
                  </div>
                  <button className={`${secondaryBtn} !py-1.5 text-sm sm:col-span-2`}>Save address</button>
                </form>
              </details>
            </div>
          )}
          <ul className="divide-y divide-gray-100">
            {items.map((i) => (
              <li key={i.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <p className="font-semibold text-gray-900">
                    {i.quantity} × {i.name}
                    <span className="ml-2 text-xs font-bold uppercase tracking-wide text-gray-400">{i.physical ? 'Ships' : 'No shipping'}</span>
                  </p>
                  <Badge
                    value={i.fulfillment === 'pending' ? 'pending' : i.fulfillment === 'shipped' ? 'completed' : 'approved'}
                    label={fulfillmentLabel(i.fulfillment, i.physical)}
                  />
                </div>
                {i.physical && (i.carrier || i.tracking) && (
                  <p className="mb-2 text-sm">
                    <TrackingInfo carrier={i.carrier} tracking={i.tracking} />
                  </p>
                )}
                <form action={setItemFulfillmentAction.bind(null, order.id, i.id)} className="flex flex-wrap items-center gap-2">
                  <select name="fulfillment" defaultValue={i.fulfillment} className={`${inputClass} !w-auto !py-1.5 text-sm`}>
                    {FULFILLMENT_STATUSES.filter((f) => i.physical || f !== 'shipped').map((f) => (
                      <option key={f} value={f}>
                        {fulfillmentLabel(f, i.physical)}
                      </option>
                    ))}
                  </select>
                  {i.physical && (
                    <>
                      <select name="carrier" defaultValue={i.carrier} className={`${inputClass} !w-auto !py-1.5 text-sm`} aria-label="Shipping provider">
                        <option value="">Shipping provider</option>
                        {CARRIERS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input name="tracking" defaultValue={i.tracking} placeholder="Tracking number" className={`${inputClass} sm:!w-56 !py-1.5 text-sm`} />
                    </>
                  )}
                  <button className={`${secondaryBtn} !py-1.5 text-sm`}>Update</button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <OrderView order={order} items={items} />
    </div>
  );
}
