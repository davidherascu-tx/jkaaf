"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { checkoutAction, type ShopFormState } from "@/app/shop/actions";
import { ErrorBox, Field, inputClass } from "@/components/shop/ui";
import {
  CHECKOUT_FORM_ID,
  useCheckout,
} from "@/components/shop/CheckoutTotals";
import PhoneInput from "@/components/shop/PhoneInput";
import AddressFields from "@/components/shop/AddressFields";
import type { Address } from "@/lib/addresses";

const initial: ShopFormState = {};

export default function CheckoutForm({
  needsShipping,
  user,
  billing,
  shipping,
  sameAsBilling,
}: {
  needsShipping: boolean;
  user: { name: string; email: string } | null;
  billing: Address | null;
  shipping: Address | null;
  sameAsBilling: boolean;
}) {
  const [state, action, pending] = useActionState(checkoutAction, initial);
  const { setPending } = useCheckout();
  const [sameShip, setSameShip] = useState(user ? sameAsBilling : true);
  useEffect(() => setPending(pending), [pending, setPending]);
  return (
    <form id={CHECKOUT_FORM_ID} action={action} className="space-y-6">
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
              Already have an account?{" "}
              <Link
                href="/account/login?next=/shop/checkout"
                className="font-semibold text-red-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
          <p className="text-xs text-gray-500">
            We create your JKA/AF account with this order so you can track it.
            We also email you a link to activate it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name" required>
              <input
                name="first_name"
                autoComplete="given-name"
                required
                className={inputClass}
              />
            </Field>
            <Field label="Last name" required>
              <input
                name="last_name"
                autoComplete="family-name"
                required
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" required>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
              />
            </Field>
            <Field label="Phone">
              <PhoneInput name="phone" className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Dojo / club">
              <input name="dojo" className={inputClass} />
            </Field>
            <Field label="Rank">
              <input name="rank" className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <Field label="Password" required hint="At least 8 characters.">
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Confirm password" required>
              <input
                name="confirm"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      )}

      {user && billing ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-bold text-gray-900">Billing address</h3>
            <Link href="/account/addresses" className="text-sm font-semibold text-red-600 hover:underline">
              Change
            </Link>
          </div>
          <address className="not-italic text-sm text-gray-700 leading-relaxed">
            {billing.name}
            <br />
            {billing.line1}, {billing.city}, {billing.state} {billing.zip}
          </address>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">Billing address</h3>
          <AddressFields prefix="bill" autocomplete="billing" />
        </div>
      )}

      {needsShipping && (
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-sm font-semibold text-gray-800">
            <input
              type="checkbox"
              name="same_ship"
              checked={sameShip}
              onChange={(e) => setSameShip(e.target.checked)}
              className="h-4 w-4 accent-red-600"
            />
            Ship to my billing address
          </label>
          {!sameShip && (
            <>
              <h3 className="font-bold text-gray-900">Shipping address</h3>
              <AddressFields prefix="ship" autocomplete="shipping" defaults={shipping} />
            </>
          )}
        </div>
      )}

      <Field label="Order notes">
        <textarea
          name="notes"
          rows={3}
          maxLength={1000}
          className={inputClass}
        />
      </Field>
      <label className="flex items-start gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          name="agree"
          required
          className="mt-1 h-4 w-4 accent-red-600"
        />
        <span>
          I will pay for this order by check. My order is held until the check
          is received.
        </span>
      </label>
    </form>
  );
}
