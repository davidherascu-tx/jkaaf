import Link from "next/link";
import { getCartOwner } from "@/lib/cart";
import { getCart, type PricedLine } from "@/lib/shop";
import { formatCents, shippingText } from "@/lib/money";
import CartItemActions from "@/components/shop/CartItemActions";
import {
  Card,
  ErrorBox,
  PageShell,
  primaryBtn,
  secondaryBtn,
} from "@/components/shop/ui";

export const metadata = { title: "Cart | JKA/AF" };

export default async function CartPage() {
  const owner = await getCartOwner();
  const cart = owner ? await getCart(owner) : [];
  const hasError = cart.some((l) => "error" in l.priced);
  const total = cart.reduce(
    (s, l) => s + ("error" in l.priced ? 0 : l.priced.unitCents * l.quantity),
    0,
  );

  const shipTotal = cart.reduce(
    (s, l) => s + ("error" in l.priced ? 0 : l.priced.shippingCents * l.quantity),
    0,
  );

  return (
    <PageShell title="Your cart">
      {cart.length === 0 ? (
        <Card>
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link href="/shop" className={primaryBtn}>
            Browse the shop
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_26rem] xl:grid-cols-[minmax(0,1fr)_30rem] gap-8 items-start">
          <div className="space-y-4">
            {cart.map((l) => {
              const p = l.priced;
              return (
                <Card key={l.id} className="!p-5">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-gray-900">
                        {l.product.name}
                      </h2>
                      {"error" in p ? (
                        <div className="mt-2">
                          <ErrorBox>{p.error}</ErrorBox>
                        </div>
                      ) : (
                        <ul className="mt-1 text-sm text-gray-600">
                          {p.lines.map((x) => (
                            <li key={x.label}>
                              {x.label}: {x.value}
                            </li>
                          ))}
                          {p.recurring && (
                            <li className="font-semibold text-amber-700">
                              Renews yearly until canceled
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {"error" in p
                          ? "—"
                          : formatCents(
                              ((p as PricedLine).unitCents - (p as PricedLine).shippingCents) * l.quantity,
                            )}
                      </p>
                      <CartItemActions itemId={l.id} quantity={l.quantity} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Card className="!p-5 lg:sticky lg:top-32">
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Items</span>
              <span className="font-semibold">{formatCents(total - shipTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Shipping</span>
              <span className={`font-semibold ${shipTotal === 0 && cart.every((l) => l.product.free_shipping) ? "text-green-700" : "text-gray-700"}`}>
                {shippingText(shipTotal, cart.every((l) => l.product.free_shipping))}
              </span>
            </div>
            <div className="flex justify-between text-xl font-extrabold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>{formatCents(total)}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {hasError ? (
                <span className="text-sm text-red-700">
                  Fix or remove the highlighted items to continue.
                </span>
              ) : (
                <Link href="/shop/checkout" className={primaryBtn}>
                  Checkout
                </Link>
              )}
              <Link href="/shop" className={secondaryBtn}>
                Continue shopping
              </Link>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
