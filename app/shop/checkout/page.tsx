import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getAddresses, sameAddress } from "@/lib/addresses";
import { enabledMethods, METHOD_LABEL } from "@/lib/payments/config";
import { getCartOwner } from "@/lib/cart";
import { cartNeedsShipping, getCart } from "@/lib/shop";
import { formatCents } from "@/lib/money";
import CheckoutForm from "@/components/shop/CheckoutForm";
import {
  CheckoutProvider,
  CheckoutTotals,
  PlaceOrderButton,
} from "@/components/shop/CheckoutTotals";
import { Card, Notice, PageShell } from "@/components/shop/ui";

export const metadata = { title: "Checkout | JKA/AF" };

export default async function CheckoutPage() {
  const user = await getUser();
  const owner = await getCartOwner();
  const addresses = user ? await getAddresses(user.id) : null;
  const billing = addresses?.billing ?? null;
  const shipping = addresses?.shipping ?? null;
  const cart = owner ? await getCart(owner) : [];
  if (cart.length === 0 || cart.some((l) => "error" in l.priced))
    redirect("/shop/cart");
  const total = cart.reduce(
    (s, l) => s + ("error" in l.priced ? 0 : l.priced.unitCents * l.quantity),
    0,
  );

  return (
    <PageShell wide title="Checkout">
      <CheckoutProvider subtotalCents={total}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_26rem] xl:grid-cols-[minmax(0,1fr)_30rem] gap-8">
          <div className="space-y-5">
            {enabledMethods().length <= 1 && (
              <Notice>
                Payment method: <strong>check</strong>. After placing your order
                you will see where to send it.
              </Notice>
            )}
            <Card>
              <CheckoutForm
                needsShipping={cartNeedsShipping(cart)}
                methods={enabledMethods().map((id) => ({ id, label: METHOD_LABEL[id] }))}
                billing={billing}
                shipping={shipping}
                sameAsBilling={sameAddress(billing, shipping)}
                user={
                  user
                    ? {
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email,
                      }
                    : null
                }
              />
            </Card>
          </div>
          <div className="lg:sticky lg:top-32 self-start">
            <Card className="!p-5">
              <h2 className="font-bold text-gray-900 mb-3">Order summary</h2>
              <ul className="space-y-2 text-sm">
                {cart.map((l) => (
                  <li key={l.id} className="flex justify-between gap-3">
                    <span>
                      {l.quantity} × {l.product.name}
                      {!("error" in l.priced) && l.priced.lines.length > 0 && (
                        <span className="block text-gray-500">
                          {l.priced.lines.map((x) => x.value).join(" · ")}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold">
                      {!("error" in l.priced) &&
                        formatCents(l.priced.unitCents * l.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between text-sm text-gray-700">
                <span>Shipping</span>
                {cart.every((l) => l.product.free_shipping) ? (
                  <span className="font-semibold text-green-700">Free</span>
                ) : (
                  <span className="font-semibold text-gray-700">
                    Included in item prices
                  </span>
                )}
              </div>
              <CheckoutTotals />
              <PlaceOrderButton />
            </Card>
          </div>
        </div>
      </CheckoutProvider>
    </PageShell>
  );
}
