'use client';

import { useState, useTransition } from 'react';
import { cancelSubscriptionAction } from '@/app/account/actions';
import ConfirmDialog from '@/components/ConfirmDialog';

/** "Cancel subscription" with a confirmation window that says how long the paid membership still lasts. */
export default function CancelSubscriptionButton({ itemId, until, timeLeft }: { itemId: number; until: string; timeLeft: string }) {
  const [ask, setAsk] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setAsk(true)}
        className="text-sm font-semibold text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 cursor-pointer"
      >
        Cancel subscription
      </button>
      <ConfirmDialog
        open={ask}
        title="Cancel your subscription?"
        confirmLabel="Yes, cancel subscription"
        cancelLabel="Keep my subscription"
        busy={pending}
        onCancel={() => setAsk(false)}
        onConfirm={() =>
          start(async () => {
            await cancelSubscriptionAction(itemId);
            setAsk(false);
          })
        }
      >
        <p>It will stop renewing every year.</p>
        <p className="rounded-lg bg-green-50 border border-green-200 text-green-800 px-3 py-2 font-semibold">
          You already paid for this year, so your membership stays active until {until} ({timeLeft}).
        </p>
      </ConfirmDialog>
    </>
  );
}
