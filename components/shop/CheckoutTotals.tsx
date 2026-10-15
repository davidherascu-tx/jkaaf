"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { formatCents } from "@/lib/money";
import { primaryBtn } from "@/components/shop/ui";

interface Ctx {
  subtotalCents: number;
  /** True while the order is being placed (set by the form). */
  pending: boolean;
  setPending: (p: boolean) => void;
}

const CheckoutCtx = createContext<Ctx | null>(null);

/** Shares the order total and "placing order" state between the form and the order summary. */
export function CheckoutProvider({ subtotalCents, children }: { subtotalCents: number; children: ReactNode }) {
  const [pending, setPending] = useState(false);
  return <CheckoutCtx.Provider value={{ subtotalCents, pending, setPending }}>{children}</CheckoutCtx.Provider>;
}

export function useCheckout(): Ctx {
  const c = useContext(CheckoutCtx);
  if (!c) throw new Error("useCheckout must be used inside CheckoutProvider");
  return c;
}

export const CHECKOUT_FORM_ID = "checkout-form";

/** Total line for the order summary. */
export function CheckoutTotals() {
  const { subtotalCents } = useCheckout();
  return (
    <div className="flex justify-between text-lg font-extrabold mt-1">
      <span>Total</span>
      <span>{formatCents(subtotalCents)}</span>
    </div>
  );
}

/** Submit button for the checkout form, shown in the order summary (linked to the form by id). */
export function PlaceOrderButton() {
  const { pending } = useCheckout();
  return (
    <button type="submit" form={CHECKOUT_FORM_ID} disabled={pending} className={`${primaryBtn} w-full mt-4`}>
      {pending ? "Placing order…" : "Place order"}
    </button>
  );
}
