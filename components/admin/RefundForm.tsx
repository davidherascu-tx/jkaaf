'use client';

import { useActionState, useRef, useState } from 'react';
import { refundPaymentAction, type RefundState } from '@/app/admin/actions';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ErrorBox, inputClass, Notice } from '@/components/shop/ui';

/** Amount (pre-filled with everything still refundable) + reason + the Send refund button for one payment. */
export default function RefundForm({
  orderId,
  paymentId,
  remainingCents,
  provider,
  highlight,
}: {
  orderId: number;
  paymentId: number;
  remainingCents: number;
  provider: 'check' | 'stripe' | 'paypal';
  /** True for a cancelled order that still holds money: the button is then the main thing to click. */
  highlight: boolean;
}) {
  const [state, action, pending] = useActionState(refundPaymentAction.bind(null, orderId, paymentId), {} as RefundState);
  const label = provider === 'check' ? 'Record refund (check mailed)' : 'Send refund';
  const formRef = useRef<HTMLFormElement>(null);
  const confirmed = useRef(false);
  const [ask, setAsk] = useState<{ amount: string } | null>(null);
  const via = provider === 'stripe' ? 'Stripe' : provider === 'paypal' ? 'PayPal' : 'check';
  return (
    <form
      ref={formRef}
      action={action}
      key={state.done ?? 'form'}
      onSubmit={(e) => {
        // First press: ask. The dialog's confirm button submits again with confirmed set.
        if (confirmed.current) {
          confirmed.current = false;
          return;
        }
        e.preventDefault();
        setAsk({ amount: (e.currentTarget.elements.namedItem('amount') as HTMLInputElement).value });
      }}
      className="mt-3 space-y-2"
    >
      <ConfirmDialog
        open={!!ask}
        title={provider === 'check' ? 'Record this refund?' : 'Send this refund?'}
        confirmLabel={provider === 'check' ? 'Record refund' : 'Send refund'}
        cancelLabel="Go back"
        onCancel={() => setAsk(null)}
        onConfirm={() => {
          setAsk(null);
          confirmed.current = true;
          formRef.current?.requestSubmit();
        }}
      >
        <p className="text-2xl font-extrabold text-gray-900">${ask?.amount}</p>
        <p>
          {provider === 'check'
            ? 'Only record it after the refund check has been mailed. The customer is emailed.'
            : `The money goes back to the customer through ${via}, and they are emailed.`}
        </p>
        <p className="font-semibold text-red-700">This cannot be undone.</p>
      </ConfirmDialog>
      {state.error && <ErrorBox>{state.error}</ErrorBox>}
      {state.done && <Notice tone="ok">{state.done}</Notice>}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">$</span>
        <input
          name="amount"
          defaultValue={(remainingCents / 100).toFixed(2)}
          inputMode="decimal"
          aria-label="Refund amount in dollars"
          className={`${inputClass} !w-28 !py-1.5 text-sm`}
          required
        />
        <input name="reason" placeholder="Reason (optional)" maxLength={200} className={`${inputClass} !w-64 !py-1.5 text-sm`} />
        <button
          disabled={pending}
          className={`px-4 py-1.5 text-sm font-bold rounded-xl cursor-pointer disabled:opacity-60 ${
            highlight ? 'bg-red-600 text-white hover:bg-red-700' : 'border border-red-200 text-red-600 hover:bg-red-50'
          }`}
        >
          {pending ? 'Sending…' : label}
        </button>
      </div>
      {provider === 'check' && <p className="text-xs text-gray-500">Mail the customer a check first, then record it here. The customer is emailed.</p>}
    </form>
  );
}
