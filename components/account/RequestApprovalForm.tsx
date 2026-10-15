'use client';

import { useActionState } from 'react';
import { requestApprovalAction, type SaveState } from '@/app/account/actions';
import { ErrorBox, Field, inputClass, primaryBtn } from '@/components/shop/ui';

export default function RequestApprovalForm({ dojo, rank }: { dojo: string; rank: string }) {
  const [state, action, pending] = useActionState(requestApprovalAction, {} as SaveState);
  return (
    <form action={action} className="space-y-4 max-w-xl">
      {state.error && <ErrorBox>{state.error}</ErrorBox>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Dojo / club" required>
          <input name="dojo" defaultValue={dojo} required className={inputClass} />
        </Field>
        <Field label="Rank" required>
          <input name="rank" defaultValue={rank} required className={inputClass} />
        </Field>
      </div>
      <Field label="Message (optional)">
        <textarea name="note" rows={3} maxLength={1000} className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? 'Sending…' : 'Request approval'}
      </button>
    </form>
  );
}
