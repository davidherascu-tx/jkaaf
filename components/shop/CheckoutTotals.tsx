"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { rateLabel, salesTaxCents, stateRate } from "@/lib/taxRules";
import { formatCents } from "@/lib/money";
import { primaryBtn } from "@/components/shop/ui";

interface Ctx {
  shipState: string;
  setShipState: (s: string) => void;
  subtotalCents: number;
  needsShipping: boolean;
  /** True while the order is being placed (set by the form). */
  pending: boolean;
  setPending: (p: boolean) => void;
}

const CheckoutCtx = createContext<Ctx | null>(null);

/** Shares the chosen shipping state between the form and the order summary so tax updates in both. */
export function CheckoutProvider({
  subtotalCents,
  needsShipping,
  children,
}: {
  subtotalCents: number;
  needsShipping: boolean;
  children: ReactNode;
}) {
  const [shipState, setShipState] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <CheckoutCtx.Provider
      value={{ shipState, setShipState, subtotalCents, needsShipping, pending, setPending }}
    >
      {children}
    </CheckoutCtx.Provider>
  );
}

export function useCheckout(): Ctx {
  const c = useContext(CheckoutCtx);
  if (!c) throw new Error("useCheckout must be used inside CheckoutProvider");
  return c;
}

/** Small info icon that opens a popup explaining the estimated sales tax. */
function TaxInfo() {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label="About estimated sales tax"
        title="About estimated sales tax"
        className="inline-flex align-middle text-gray-400 hover:text-red-600 cursor-pointer"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11.5a1 1 0 11-2 0 1 1 0 012 0zM9 9h2v5H9V9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <dialog
        ref={ref}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-auto w-[min(92vw,28rem)] rounded-2xl p-0 backdrop:bg-black/40"
      >
        <div className="p-6 text-sm text-gray-700 space-y-3">
          <h3 className="text-lg font-bold text-gray-900">About estimated sales tax</h3>
          <p>
            Sales tax is estimated from the <strong>state</strong> in your address, using that state&apos;s sales tax
            rate. If nothing in your order ships, we use your billing address.
          </p>
          <p>
            City, county and other local taxes are not included, so the amount you owe may be slightly different. The
            tax shown here is the amount added to your order total.
          </p>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="mt-2 w-full rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white hover:bg-gray-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}

/** Sales tax and total lines for the order summary. */
export function CheckoutTotals() {
  const { shipState, subtotalCents } = useCheckout();
  const tax = salesTaxCents(subtotalCents, shipState);
  return (
    <>
      <div className="flex justify-between text-sm text-gray-700 mt-1">
        <span>
          Estimated sales tax
          {tax > 0 ? ` (${rateLabel(stateRate(shipState))})` : ""}{" "}
          <TaxInfo />
        </span>
        {shipState ? (
          <span className="font-semibold">{formatCents(tax)}</span>
        ) : (
          <span className="font-semibold text-gray-500">
            ---
          </span>
        )}
      </div>
      <div className="flex justify-between text-lg font-extrabold mt-1">
        <span>Total</span>
        <span>{formatCents(subtotalCents + tax)}</span>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Estimated sales tax is based on the state in your address (state rate only).
      </p>
    </>
  );
}

export const CHECKOUT_FORM_ID = "checkout-form";

/** Submit button for the checkout form, shown in the order summary (linked to the form by id). */
export function PlaceOrderButton() {
  const { pending } = useCheckout();
  return (
    <button
      type="submit"
      form={CHECKOUT_FORM_ID}
      disabled={pending}
      className={`${primaryBtn} w-full mt-4`}
    >
      {pending ? "Placing order…" : "Place order"}
    </button>
  );
}
