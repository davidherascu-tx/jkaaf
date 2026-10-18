'use client';

import { useActionState, useRef, useState } from 'react';
import { cancelOrderAction, submitOrderRequestAction, type OrderRequestState } from '@/app/shop/actions';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Badge, Card, ErrorBox, inputClass, Notice, primaryBtn, secondaryBtn } from '@/components/shop/ui';

type RequestType = 'cancel' | 'return' | 'refund';

export interface RequestView {
  id: number;
  type: RequestType;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  admin_note: string;
  created_at: string;
}

const LABEL: Record<RequestType, string> = { cancel: 'Cancellation request', return: 'Return request', refund: 'Refund request' };
const BUTTON: Record<RequestType, string> = { cancel: 'Request cancellation', return: 'Request a return', refund: 'Request a refund' };
const HELP: Record<RequestType, string> = {
  cancel: 'This order is paid and has not shipped yet. We review the request, cancel the order and refund your payment.',
  return: 'Tell us what you want to return and why. If we approve it, we email you the next steps.',
  refund: 'Tell us why you would like a refund. If we approve it, the money goes back to your original payment method.',
};

function RequestForm({ orderId, type, onClose }: { orderId: number; type: RequestType; onClose: () => void }) {
  const [state, action, pending] = useActionState(submitOrderRequestAction.bind(null, orderId, type), {} as OrderRequestState);
  if (state.done) return <Notice tone="ok">{state.done}</Notice>;
  return (
    <form action={action} className="mt-3 space-y-3">
      <p className="text-sm text-gray-600">{HELP[type]}</p>
      {state.error && <ErrorBox>{state.error}</ErrorBox>}
      <textarea name="reason" rows={3} maxLength={1000} required placeholder="Reason" className={inputClass} />
      <div className="flex flex-wrap gap-2">
        <button disabled={pending} className={`${primaryBtn} disabled:opacity-60`}>
          {pending ? 'Sending…' : 'Send request'}
        </button>
        <button type="button" onClick={onClose} className={secondaryBtn}>
          Never mind
        </button>
      </div>
    </form>
  );
}

/** Cancel / return / refund for a customer's order, plus the requests already sent. */
export default function OrderRequests({
  orderId,
  actions,
  requests,
}: {
  orderId: number;
  actions: { cancelNow: boolean; cancel: boolean; return: boolean; refund: boolean };
  requests: RequestView[];
}) {
  const [open, setOpen] = useState<RequestType | null>(null);
  const [ask, setAsk] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmed = useRef(false);
  const available = (['cancel', 'return', 'refund'] as const).filter((t) => actions[t]);
  if (!actions.cancelNow && available.length === 0 && requests.length === 0) return null;

  return (
    <Card className="!p-5">
      <h2 className="font-bold text-gray-900 mb-1">Cancel, return or refund</h2>

      {requests.length > 0 && (
        <ul className="my-3 space-y-2">
          {requests.map((r) => (
            <li key={r.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-gray-900">
                  {LABEL[r.type]} <span className="font-normal text-gray-500">· {r.created_at} UTC</span>
                </p>
                <Badge value={r.status} label={r.status === 'pending' ? 'Waiting for review' : r.status === 'approved' ? 'Approved' : 'Declined'} />
              </div>
              {r.reason && <p className="mt-1 text-gray-600">Your reason: {r.reason}</p>}
              {r.admin_note && <p className="mt-1 text-gray-800">Message from JKA/AF: {r.admin_note}</p>}
            </li>
          ))}
        </ul>
      )}

      {actions.cancelNow && (
        <form ref={formRef} action={cancelOrderAction.bind(null, orderId)} onSubmit={(e) => {
            // First press asks; the dialog's confirm button submits again with confirmed set.
            if (confirmed.current) {
              confirmed.current = false;
              return;
            }
            e.preventDefault();
            setAsk(true);
          }}
          className="mt-3"
        >
          <ConfirmDialog
            open={ask}
            title="Cancel this order?"
            confirmLabel="Cancel order"
            cancelLabel="Keep order"
            onCancel={() => setAsk(false)}
            onConfirm={() => {
              setAsk(false);
              confirmed.current = true;
              formRef.current?.requestSubmit();
            }}
          >
            <p>This order has not been paid, so nothing is charged. It will be cancelled.</p>
          </ConfirmDialog>
          <p className="text-sm text-gray-600 mb-3">This order is not paid yet. You can cancel it.</p>
          <button className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 cursor-pointer">
            Cancel order
          </button>
        </form>
      )}

      {available.length > 0 && !open && (
        <div className="mt-3 flex flex-wrap gap-2">
          {available.map((t) => (
            <button key={t} type="button" onClick={() => setOpen(t)} className={secondaryBtn}>
              {BUTTON[t]}
            </button>
          ))}
        </div>
      )}
      {open && <RequestForm orderId={orderId} type={open} onClose={() => setOpen(null)} />}
    </Card>
  );
}
