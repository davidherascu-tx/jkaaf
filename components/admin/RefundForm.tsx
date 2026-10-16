'use client';

import { useActionState } from 'react';
import { refundPaymentAction, type RefundState } from '@/app/admin/actions';
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
  return (
    <form
      action={action}
      key={state.done ?? 'form'}
      onSubmit={(e) => {
        const amount = (e.currentTarget.elements.namedItem('amount') as HTMLInputElement).value;
        const what = provider === 'check' ? 'Record a refund' : `Send a refund through ${provider === 'stripe' ? 'Stripe' : 'PayPal'}`;
        if (!confirm(`${what} of $${amount}? This cannot be undone.`)) e.preventDefault();
      }}
      className="mt-3 space-y-2"
    >
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
