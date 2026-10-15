'use client';

import { removeCartItemAction, updateCartAction } from '@/app/shop/actions';

/** Tells the navbar cart icon to reload its count. */
const refreshCartIcon = () => window.dispatchEvent(new Event('cart-updated'));

/** Quantity + Remove for one cart line. Refreshes the cart icon as soon as the change is saved. */
export default function CartItemActions({ itemId, quantity }: { itemId: number; quantity: number }) {
  return (
    <>
      <form
        action={async (fd) => {
          await updateCartAction(itemId, fd);
          refreshCartIcon();
        }}
        className="mt-2 flex items-center gap-2 justify-end"
      >
        <input
          name="quantity"
          type="number"
          min={0}
          max={99}
          defaultValue={quantity}
          aria-label="Quantity"
          className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
        />
        <button className="text-sm font-semibold text-gray-600 hover:text-red-600 cursor-pointer">Update</button>
      </form>
      <form
        action={async () => {
          await removeCartItemAction(itemId);
          refreshCartIcon();
        }}
      >
        <button className="mt-1 text-sm font-semibold text-red-600 hover:underline cursor-pointer">Remove</button>
      </form>
    </>
  );
}
