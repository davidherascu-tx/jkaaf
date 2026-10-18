import { listOrderRequests, REQUEST_LABEL } from '@/lib/orderRequests';
import { resolveOrderRequestAction } from '@/app/admin/actions';
import { Badge, Card, inputClass, secondaryBtn } from '@/components/shop/ui';

const NEXT_STEP = {
  cancel: 'Approving cancels the order and puts the items back in stock. Then send the refund in "Payments & refunds".',
  return: 'Approving only records your decision and emails the customer. Send the refund below once the return arrives.',
  refund: 'Approving only records your decision and emails the customer. Send the refund in "Payments & refunds".',
} as const;

/** Cancel / return / refund requests the customer sent for this order. Renders nothing when there are none. */
export default async function OrderRequestsCard({ orderId }: { orderId: number }) {
  const requests = await listOrderRequests(orderId);
  if (requests.length === 0) return null;
  const waiting = requests.some((r) => r.status === 'pending');
  return (
    <Card className={`!p-5 ${waiting ? '!border-amber-300' : ''}`}>
      <h2 className="font-bold text-gray-900 mb-3">Customer requests</h2>
      <ul className="space-y-4">
        {requests.map((r) => (
          <li key={r.id} className="text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-gray-900">
                {REQUEST_LABEL[r.type]} <span className="font-normal text-gray-500">· {r.created_at} UTC</span>
              </p>
              <Badge value={r.status} label={r.status === 'pending' ? 'Waiting for you' : r.status === 'approved' ? 'Approved' : 'Declined'} />
            </div>
            <p className="mt-1 text-gray-700">Reason: {r.reason || '—'}</p>
            {r.status !== 'pending' && r.admin_note && <p className="mt-1 text-gray-600">Your message: {r.admin_note}</p>}
            {r.status === 'pending' && (
              <form className="mt-3 space-y-2">
                <input name="note" maxLength={500} placeholder="Message to the customer (optional)" className={`${inputClass} !py-1.5 text-sm`} />
                <p className="text-xs text-gray-500">{NEXT_STEP[r.type]}</p>
                <div className="flex flex-wrap gap-2">
                  <button formAction={resolveOrderRequestAction.bind(null, r.id, 'approved')} className="px-4 py-1.5 text-sm font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 cursor-pointer">
                    Approve
                  </button>
                  <button formAction={resolveOrderRequestAction.bind(null, r.id, 'declined')} className={`${secondaryBtn} !py-1.5 text-sm`}>
                    Decline
                  </button>
                </div>
              </form>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
