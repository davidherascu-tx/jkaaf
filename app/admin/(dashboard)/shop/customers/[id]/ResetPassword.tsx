'use client';

import { useActionState } from 'react';
import { createCustomerResetLinkAction, sendCustomerResetEmailAction, type ResetState } from '@/app/admin/actions';
import { ErrorBox, Notice, secondaryBtn } from '@/components/shop/ui';

export default function ResetPassword({ userId }: { userId: number }) {
  const [emailState, sendEmail, sending] = useActionState<ResetState, FormData>(sendCustomerResetEmailAction.bind(null, userId), {});
  const [linkState, makeLink, making] = useActionState<ResetState, FormData>(createCustomerResetLinkAction.bind(null, userId), {});
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <form action={sendEmail}>
          <button disabled={sending} className={secondaryBtn}>
            {sending ? 'Sending…' : 'Email a reset link'}
          </button>
        </form>
        <form action={makeLink}>
          <button disabled={making} className={secondaryBtn}>
            {making ? 'Creating…' : 'Create a reset link'}
          </button>
        </form>
      </div>
      {emailState.ok && <Notice tone="ok">{emailState.ok}</Notice>}
      {emailState.error && <ErrorBox>{emailState.error}</ErrorBox>}
      {linkState.error && <ErrorBox>{linkState.error}</ErrorBox>}
      {linkState.link && (
        <Notice tone="warn">
          <p className="font-semibold mb-1">Give this link to the customer. It works once and expires in 1 hour.</p>
          <input readOnly value={linkState.link} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-gray-900" />
        </Notice>
      )}
    </div>
  );
}
