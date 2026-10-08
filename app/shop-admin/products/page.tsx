import Link from 'next/link';
import { deleteProductAction, setStockAction, toggleProductAction } from '@/app/shop-admin/actions';
import { isOnSale, listProducts } from '@/lib/shop';
import { formatCents } from '@/lib/money';
import { Badge, Card, primaryBtn } from '@/components/shop/ui';

export default async function AdminProducts() {
  const products = await listProducts(true);
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Products</h1>
        <Link href="/shop-admin/products/new" className={primaryBtn}>
          Add product
        </Link>
      </div>
      <Card className="!p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-4 font-semibold text-gray-900">
                  {p.name}
                  <span className="block text-xs font-normal text-gray-500">
                    {p.options.map((o) => o.label).join(', ') || 'No options'}
                  </span>
                </td>
                <td className="p-4">
                  {formatCents(p.price_cents)} {p.price_note && <span className="text-gray-500">{p.price_note}</span>}
                  {p.sale_price_cents !== null && (
                    <span className="block text-xs text-red-600 font-semibold">
                      Sale {formatCents(p.sale_price_cents)} until {p.sale_ends_on}
                      {isOnSale(p) ? '' : ' (ended)'}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <form action={setStockAction.bind(null, p.id)} className="flex items-center gap-2">
                    <input
                      name="stock"
                      defaultValue={p.stock ?? ''}
                      placeholder="not tracked"
                      inputMode="numeric"
                      aria-label={`Stock for ${p.name}`}
                      className={`w-24 px-2 py-1.5 border rounded-lg text-sm ${
                        p.stock !== null && p.stock <= 5 ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    <button className="text-xs font-semibold text-gray-600 hover:text-red-600 cursor-pointer">Save</button>
                  </form>
                  {p.stock !== null && p.stock <= 0 && <span className="text-xs font-bold text-red-600">Out of stock</span>}
                </td>
                <td className="p-4">
                  <Badge value={p.active ? 'approved' : 'cancelled'} label={p.active ? 'Active' : 'Hidden'} />
                </td>
                <td className="p-4">
                  <div className="flex gap-4 justify-end">
                    <Link href={`/shop-admin/products/${p.id}`} className="font-semibold text-red-600 hover:underline">
                      Edit
                    </Link>
                    <form action={toggleProductAction.bind(null, p.id, !p.active)}>
                      <button className="font-semibold text-gray-600 hover:underline cursor-pointer">
                        {p.active ? 'Hide' : 'Show'}
                      </button>
                    </form>
                    <form action={deleteProductAction.bind(null, p.id)}>
                      <button className="font-semibold text-gray-600 hover:text-red-600 hover:underline cursor-pointer">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-gray-500 mt-3">
        Stock goes down automatically when an order is placed and returns if the order is cancelled. Leave it blank for
        items you do not count (renewals, memberships). Products already on an order are hidden instead of deleted, so
        order history stays intact.
      </p>
    </>
  );
}
