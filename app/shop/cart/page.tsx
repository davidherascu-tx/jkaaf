import Link from 'next/link';
import { getCartOwner } from '@/lib/cart';
import { getCart, type PricedLine } from '@/lib/shop';
import { formatCents } from '@/lib/money';
import { removeCartItemAction, updateCartAction } from '@/app/shop/actions';
import { Card, ErrorBox, PageShell, primaryBtn, secondaryBtn } from '@/components/shop/ui';

export const metadata = { title: 'Cart | JKA/AF' };

export default async function CartPage() {
  const owner = await getCartOwner();
  const cart = owner ? getCart(owner) : [];
  const hasError = cart.some((l) => 'error' in l.priced);
  const total = cart.reduce((s, l) => s + ('error' in l.priced ? 0 : l.priced.unitCents * l.quantity), 0);

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
        <div className="space-y-4">
          {cart.map((l) => {
            const p = l.priced;
            return (
              <Card key={l.id} className="!p-5">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-gray-900">{l.product.name}</h2>
                    {'error' in p ? (
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
                        {p.recurring && <li className="font-semibold text-amber-700">Renews yearly until canceled</li>}
                      </ul>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{'error' in p ? '—' : formatCents((p as PricedLine).unitCents * l.quantity)}</p>
                    <form action={updateCartAction.bind(null, l.id)} className="mt-2 flex items-center gap-2 justify-end">
                      <input
                        name="quantity"
                        type="number"
                        min={0}
                        max={99}
                        defaultValue={l.quantity}
                        aria-label="Quantity"
                        className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                      />
                      <button className="text-sm font-semibold text-gray-600 hover:text-red-600 cursor-pointer">Update</button>
                    </form>
                    <form action={removeCartItemAction.bind(null, l.id)}>
                      <button className="mt-1 text-sm font-semibold text-red-600 hover:underline cursor-pointer">Remove</button>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
          <Card className="!p-5">
            <div className="flex justify-between text-gray-700">
              <span>Shipping</span>
              {cart.every((l) => l.product.free_shipping) ? (
                <span className="font-semibold text-green-700">Free</span>
              ) : (
                <span className="font-semibold text-gray-700">Included in item prices</span>
              )}
            </div>
            <div className="flex justify-between text-xl font-extrabold mt-2">
              <span>Total</span>
              <span>{formatCents(total)}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {hasError ? (
                <span className="text-sm text-red-700">Fix or remove the highlighted items to continue.</span>
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
