'use client';

import { useActionState, useState } from 'react';
import {
  changeEmailAction,
  saveAddressesAction,
  updateProfileAction,
  type SaveState,
} from '@/app/account/actions';
import type { Address } from '@/lib/addresses';
import AddressFields from '@/components/shop/AddressFields';
import { ErrorBox, Field, inputClass, Notice, primaryBtn, secondaryBtn } from '@/components/shop/ui';
import PhoneInput from '@/components/shop/PhoneInput';

const initial: SaveState = {};

export function ProfileForm({ user }: { user: { first_name: string; last_name: string; phone: string; dojo: string; rank: string } }) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);
  const [phone, setPhone] = useState(user.phone);
  return (
    <form action={action} className="space-y-5">
      {state.error && <ErrorBox>{state.error}</ErrorBox>}
      {state.saved && <Notice tone="ok">Your details were saved.</Notice>}
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="First name" required>
          <input name="first_name" defaultValue={user.first_name} required className={inputClass} />
        </Field>
        <Field label="Last name" required>
          <input name="last_name" defaultValue={user.last_name} required className={inputClass} />
        </Field>
        <Field label="Phone">
          <PhoneInput name="phone" value={phone} onChange={setPhone} className={inputClass} />
        </Field>
        <Field label="Dojo / club">
          <input name="dojo" defaultValue={user.dojo} className={inputClass} />
        </Field>
        <Field label="Rank">
          <input name="rank" defaultValue={user.rank} className={inputClass} />
        </Field>
      </div>
      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

export function ChangeEmailForm() {
  const [state, action, pending] = useActionState(changeEmailAction, initial);
  return (
    <form action={action} className="space-y-4 max-w-md" key={state.saved ? 'done' : 'form'}>
      {state.error && <ErrorBox>{state.error}</ErrorBox>}
      {state.saved && state.note && <Notice tone="ok">{state.note}</Notice>}
      <Field label="New email address" required>
        <input name="new_email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Current password" required hint="We ask for it to keep your account safe.">
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? 'Sending…' : 'Change email'}
      </button>
    </form>
  );
}

function AddressBlock({ title, a }: { title: string; a: Address }) {
  return (
  <div>
    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{title}</h3>
    <address className="not-italic text-gray-700 leading-relaxed">
      <strong className="text-gray-900">{a.name}</strong>
      <br />
      {a.line1}
      <br />
      {a.city}, {a.state} {a.zip}
      {a.phone && (
        <>
          <br />
          {a.phone}
        </>
      )}
    </address>
  </div>
  );
}

export function AddressesForm({
  billing,
  shipping,
  sameAsBilling,
  defaultName,
}: {
  billing: Address | null;
  shipping: Address | null;
  sameAsBilling: boolean;
  defaultName: string;
}) {
  const [editing, setEditing] = useState(!billing || !shipping);
  const [same, setSame] = useState(!shipping || sameAsBilling);
  const [phone, setPhone] = useState(billing?.phone ?? '');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (!editing && billing && shipping) {
    return (
      <div className="space-y-5">
        {sameAsBilling ? (
          <AddressBlock title="Billing and shipping address" a={billing} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            <AddressBlock title="Billing address" a={billing} />
            <AddressBlock title="Shipping address" a={shipping} />
          </div>
        )}
        <button type="button" onClick={() => setEditing(true)} className={secondaryBtn}>
          Edit
        </button>
      </div>
    );
  }

  return (
    <form
      action={async (fd) => {
        setPending(true);
        const res = await saveAddressesAction({}, fd);
        setPending(false);
        setError(res.error ?? '');
        if (!res.error) setEditing(false);
      }}
      className="space-y-6"
    >
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">Billing address</h3>
        <AddressFields prefix="bill" autocomplete="billing" defaults={{ name: billing?.name ?? defaultName, ...billing }} />
        <Field label="Phone">
          <PhoneInput name="phone" value={phone} onChange={setPhone} className={inputClass} />
        </Field>
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold text-gray-800">
        <input type="checkbox" name="same_shipping" checked={same} onChange={(e) => setSame(e.target.checked)} className="h-4 w-4 accent-red-600" />
        Shipping address is the same as billing address
      </label>

      {!same && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">Shipping address</h3>
          <AddressFields prefix="ship" autocomplete="shipping" defaults={{ name: shipping?.name ?? defaultName, ...shipping }} />
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? 'Saving…' : 'Save addresses'}
        </button>
        {billing && shipping && (
          <button type="button" onClick={() => setEditing(false)} className={secondaryBtn}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
