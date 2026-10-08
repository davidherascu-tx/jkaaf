'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUser, getUserById } from '@/lib/auth';
import { createAccount } from '@/lib/accounts';
import { ensureCartOwner, getCartOwner } from '@/lib/cart';
import {
  addToCart,
  cartNeedsShipping,
  getCart,
  getProductById,
  placeOrder,
  setCartQuantity,
  type Selections,
} from '@/lib/shop';

export interface ShopFormState {
  error?: string;
  added?: number;
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();

export async function addToCartAction(productId: number, _prev: ShopFormState, fd: FormData): Promise<ShopFormState> {
  const product = await getProductById(productId);
  if (!product || !product.active) return { error: 'This product is not available.' };

  const selections: Selections = {};
  for (const opt of product.options) selections[opt.id] = str(fd, `opt_${opt.id}`);
  const qty = Math.min(Math.max(parseInt(str(fd, 'quantity'), 10) || 1, 1), 99);

  const err = await addToCart(await ensureCartOwner(), product, selections, qty);
  if (err) return { error: err };
  revalidatePath('/shop/cart');
  return { added: Date.now() };
}

export async function updateCartAction(itemId: number, fd: FormData) {
  const owner = await getCartOwner();
  if (!owner) return;
  const qty = parseInt(str(fd, 'quantity'), 10);
  await setCartQuantity(owner, itemId, Number.isFinite(qty) ? qty : 1);
  revalidatePath('/shop/cart');
}

export async function removeCartItemAction(itemId: number) {
  const owner = await getCartOwner();
  if (!owner) return;
  await setCartQuantity(owner, itemId, 0);
  revalidatePath('/shop/cart');
}

/** Places the order. Guests create their account here, as part of checkout. */
export async function checkoutAction(_prev: ShopFormState, fd: FormData): Promise<ShopFormState> {
  let user = await getUser();
  const owner = await getCartOwner();
  if (!owner) return { error: 'Your cart is empty.' };

  const cart = await getCart(owner);
  const ship = {
    name: str(fd, 'ship_name'),
    address: str(fd, 'ship_address'),
    city: str(fd, 'ship_city'),
    state: str(fd, 'ship_state'),
    zip: str(fd, 'ship_zip'),
  };
  if (cartNeedsShipping(cart) && Object.values(ship).some((v) => !v)) {
    return { error: 'Please complete the shipping address.' };
  }
  if (str(fd, 'agree') !== 'on') return { error: 'Please confirm you will pay by check.' };

  if (!user) {
    const res = await createAccount({
      email: str(fd, 'email'),
      password: String(fd.get('password') ?? ''),
      confirm: String(fd.get('confirm') ?? ''),
      first_name: str(fd, 'first_name'),
      last_name: str(fd, 'last_name'),
      phone: str(fd, 'phone'),
      dojo: str(fd, 'dojo'),
      rank: str(fd, 'rank'),
    });
    if ('error' in res) return { error: res.error };
    user = await getUserById(res.id);
    if (!user) return { error: 'Could not create your account. Please try again.' };
  }

  const result = await placeOrder(user, ship, str(fd, 'notes').slice(0, 1000));
  if ('error' in result) return { error: result.error };
  redirect(`/shop/orders/${result.orderId}?placed=1`);
}
