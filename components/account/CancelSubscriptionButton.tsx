'use client';

import { cancelSubscriptionAction } from '@/app/account/actions';

export default function CancelSubscriptionButton({ itemId }: { itemId: number }) {
  return (
    <form
      action={cancelSubscriptionAction.bind(null, itemId)}
      onSubmit={(e) => {
        if (!confirm('Cancel this subscription? It will stop renewing every year.')) e.preventDefault();
      }}
    >
      <button className="text-sm font-semibold text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 cursor-pointer">
        Cancel subscription
      </button>
    </form>
  );
}
