'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { addToCartAction, type ShopFormState } from '@/app/shop/actions';
import { ErrorBox, inputClass, primaryBtn } from '@/components/shop/ui';
import { formatCents } from '@/lib/money';
import type { Product } from '@/lib/shop';

const initial: ShopFormState = {};

export default function AddToCartForm({
  product,
  clubs,
  compact,
}: {
  product: Product;
  clubs: string[];
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(addToCartAction.bind(null, product.id), initial);

  // Tell the navbar the cart changed so the badge updates immediately.
  useEffect(() => {
    if (state.added) window.dispatchEvent(new Event('cart-updated'));
  }, [state.added]);

  const field = compact ? `${inputClass} !py-2 text-sm` : inputClass;

  return (
    <form action={action} className="space-y-3">
      {state.error && <ErrorBox>{state.error}</ErrorBox>}
      {product.options.map((opt) => (
        <div key={opt.id}>
          <label className={`block font-bold text-gray-800 mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {opt.label}
            {opt.required && <span className="text-red-600 ml-0.5">*</span>}
          </label>
          {opt.type === 'select' ? (
            <select name={`opt_${opt.id}`} required={opt.required} defaultValue="" className={field}>
              <option value="" disabled>
                Select…
              </option>
              {opt.choices?.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}
                  {c.priceCents > 0 ? ` (+${formatCents(c.priceCents)})` : ''}
                </option>
              ))}
            </select>
          ) : opt.type === 'club' ? (
            <select name={`opt_${opt.id}`} required={opt.required} defaultValue={clubs.length === 1 ? clubs[0] : ''} className={field}>
              <option value="" disabled>
                Select your club…
              </option>
              {clubs.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <input name={`opt_${opt.id}`} required={opt.required} maxLength={200} className={field} />
          )}
        </div>
      ))}
      <div className="flex items-center gap-3">
        <input
          name="quantity"
          type="number"
          min={1}
          max={product.stock !== null ? Math.max(product.stock, 1) : 99}
          defaultValue={1}
          aria-label="Quantity"
          className={`${field} !w-20 shrink-0`}
        />
        <button type="submit" disabled={pending} className={`${primaryBtn} flex-1 ${compact ? '!py-2.5' : ''}`}>
          {pending ? 'Adding…' : 'Add to cart'}
        </button>
      </div>
      {state.added && !state.error && !pending && (
        <p className="text-sm font-semibold text-green-700">
          Added to cart.{' '}
          <Link href="/shop/cart" className="underline">
            View cart
          </Link>
        </p>
      )}
    </form>
  );
}
