'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { checkoutAction, type ShopFormState } from '@/app/shop/actions';
import { ErrorBox, Field, inputClass, primaryBtn } from '@/components/shop/ui';

const initial: ShopFormState = {};

export default function CheckoutForm({
  needsShipping,
  user,
}: {
  needsShipping: boolean;
  user: { name: string; email: string } | null;
}) {
  const [state, action, pending] = useActionState(checkoutAction, initial);
  return (
    <form action={action} className="space-y-6">
      {state.error && <ErrorBox>{state.error}</ErrorBox>}

      {user ? (
        <p className="text-sm text-gray-700">
          Ordering as <strong>{user.name}</strong> ({user.email}).
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-bold text-gray-900">Your details</h3>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/account/login?next=/shop/checkout" className="font-semibold text-red-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
          <p className="text-xs text-gray-500">
            We create your JKA/AF account with this order so you can track it. New accounts are reviewed and approved by
            JKA/AF.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="First name" required>
              <input name="first_name" autoComplete="given-name" required className={inputClass} />
            </Field>
            <Field label="Last name" required>
              <input name="last_name" autoComplete="family-name" required className={inputClass} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email" required>
              <input name="email" type="email" autoComplete="email" required className={inputClass} />
            </Field>
            <Field label="Phone">
              <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Dojo / club">
              <input name="dojo" className={inputClass} />
            </Field>
            <Field label="Rank">
              <input name="rank" className={inputClass} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Password" required hint="At least 8 characters.">
              <input name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
            </Field>
            <Field label="Confirm password" required>
              <input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
            </Field>
          </div>
        </div>
      )}

      {needsShipping && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">Shipping address</h3>
          <Field label="Full name" required>
            <input name="ship_name" defaultValue={user?.name ?? ''} autoComplete="name" required className={inputClass} />
          </Field>
          <Field label="Street address" required>
            <input name="ship_address" autoComplete="street-address" required className={inputClass} />
          </Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="City" required>
              <input name="ship_city" autoComplete="address-level2" required className={inputClass} />
            </Field>
            <Field label="State" required>
              <input name="ship_state" autoComplete="address-level1" required className={inputClass} />
            </Field>
            <Field label="Zip" required>
              <input name="ship_zip" autoComplete="postal-code" required className={inputClass} />
            </Field>
          </div>
        </div>
      )}

      <Field label="Order notes">
        <textarea name="notes" rows={3} maxLength={1000} className={inputClass} />
      </Field>
      <label className="flex items-start gap-3 text-sm text-gray-700">
        <input type="checkbox" name="agree" required className="mt-1 h-4 w-4 accent-red-600" />
        <span>I will pay for this order by check. My order is held until the check is received.</span>
      </label>
      <button type="submit" disabled={pending} className={`${primaryBtn} w-full`}>
        {pending ? 'Placing order…' : 'Place order'}
      </button>
    </form>
  );
}
