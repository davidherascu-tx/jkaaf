"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { sendOrderInvoice } from "@/lib/orderEmail";
import { getUser, getUserById } from "@/lib/auth";
import { createAccount } from "@/lib/accounts";
import { getAddresses, saveAddress, type Address } from "@/lib/addresses";
import { ensureCartOwner, getCartOwner } from "@/lib/cart";
import { normalizeUsState } from "@/lib/regions";
import { isMethodEnabled } from "@/lib/payments/config";
import { startOnlinePayment } from "@/lib/payments";
import { siteOrigin } from "@/lib/emailVerification";
import {
  addToCart,
  cartNeedsShipping,
  getCart,
  getOrder,
  getProductById,
  placeOrder,
  setCartQuantity,
  type Selections,
} from "@/lib/shop";

export interface ShopFormState {
  error?: string;
  added?: number;
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function addToCartAction(
  productId: number,
  _prev: ShopFormState,
  fd: FormData,
): Promise<ShopFormState> {
  const product = await getProductById(productId);
  if (!product || !product.active)
    return { error: "This product is not available." };

  const selections: Selections = {};
  for (const opt of product.options)
    selections[opt.id] = str(fd, `opt_${opt.id}`);
  const qty = Math.min(Math.max(parseInt(str(fd, "quantity"), 10) || 1, 1), 99);

  const err = await addToCart(
    await ensureCartOwner(),
    product,
    selections,
    qty,
  );
  if (err) return { error: err };
  revalidatePath("/shop/cart");
  return { added: Date.now() };
}

export async function updateCartAction(itemId: number, fd: FormData) {
  const owner = await getCartOwner();
  if (!owner) return;
  const qty = parseInt(str(fd, "quantity"), 10);
  await setCartQuantity(owner, itemId, Number.isFinite(qty) ? qty : 1);
  revalidatePath("/shop/cart");
}

export async function removeCartItemAction(itemId: number) {
  const owner = await getCartOwner();
  if (!owner) return;
  await setCartQuantity(owner, itemId, 0);
  revalidatePath("/shop/cart");
}

/** Places the order. Guests create their account here, as part of checkout. */
export async function checkoutAction(
  _prev: ShopFormState,
  fd: FormData,
): Promise<ShopFormState> {
  let user = await getUser();
  const owner = await getCartOwner();
  if (!owner) return { error: "Your cart is empty." };

  const cart = await getCart(owner);
  const shipsHere = cartNeedsShipping(cart);
  const phone = str(fd, "phone") || user?.phone || "";
  const pick = (p: "bill" | "ship", phone: string): Address => ({
    name: str(fd, p + "_name"),
    line1: str(fd, p + "_line1"),
    city: str(fd, p + "_city"),
    state: normalizeUsState(str(fd, p + "_state")),
    zip: str(fd, p + "_zip"),
    phone,
  });
  const isComplete = (a: Address) => !!(a.name && a.line1 && a.city && a.state && a.zip);

  // Billing address is required: the customer's saved one, or the one typed in right here (a new customer, or a
  // signed-in customer who has not saved one yet). Whatever is typed in is saved to the account below.
  const saved = user ? await getAddresses(user.id) : null;
  const billing = saved?.billing ?? pick("bill", phone);
  if (!billing || !isComplete(billing)) return { error: "Please complete the billing address." };

  // Shipping goes to the billing address unless the customer unticked "Ship to my billing address".
  const shipAddr = shipsHere && str(fd, "same_ship") !== "on" ? pick("ship", billing.phone) : billing;
  if (!isComplete(shipAddr)) return { error: "Please complete the shipping address." };
  const ship = shipsHere
    ? { name: shipAddr.name, address: shipAddr.line1, city: shipAddr.city, state: shipAddr.state, zip: shipAddr.zip }
    : { name: "", address: "", city: "", state: "", zip: "" };
  const requested = str(fd, "payment_method") || "check";
  if (!isMethodEnabled(requested)) return { error: "Please choose a payment method." };
  const method = requested;
  if (method === "check" && str(fd, "agree") !== "on")
    return { error: "Please confirm you will pay by check." };

  if (!user) {
    const res = await createAccount({
      email: str(fd, "email"),
      password: String(fd.get("password") ?? ""),
      confirm: String(fd.get("confirm") ?? ""),
      first_name: str(fd, "first_name"),
      last_name: str(fd, "last_name"),
      phone: str(fd, "phone"),
      dojo: str(fd, "dojo"),
      rank: str(fd, "rank"),
    }, true);
    if ("error" in res) return { error: res.error };
    user = await getUserById(res.id);
    if (!user)
      return { error: "Could not create your account. Please try again." };

  }

  // Remember any address that was not saved yet, so next time checkout fills it in and they never go to the account for it.
  if (!saved?.billing) await saveAddress(user.id, "billing", billing);
  if (!saved?.shipping) await saveAddress(user.id, "shipping", shipAddr);

  const result = await placeOrder(user, ship, str(fd, "notes").slice(0, 1000), method);
  if ("error" in result) return { error: result.error };
  after(() => sendOrderInvoice(result.orderId));

  // Card / PayPal: the order exists (awaiting payment); send the customer to the payment page.
  if (method !== "check") {
    const started = await startOnlinePayment(result.orderId, method, await siteOrigin());
    if ("url" in started) redirect(started.url);
    redirect(`/shop/orders/${result.orderId}?placed=1&payerror=1`);
  }
  redirect(`/shop/orders/${result.orderId}?placed=1`);
}

/** "Pay now" on an unpaid order: card or PayPal. Only the order's owner. */
export async function payNowAction(orderId: number, method: string) {
  const user = await getUser();
  if (!user) redirect("/account/login");
  const found = await getOrder(orderId);
  if (!found || found.order.user_id !== user.id) redirect("/account/orders");
  if (method !== "stripe" && method !== "paypal") redirect(`/shop/orders/${orderId}`);
  const started = await startOnlinePayment(orderId, method, await siteOrigin());
  if ("url" in started) redirect(started.url);
  redirect(`/shop/orders/${orderId}?payerror=1`);
}
