import { currentPriceCents, isOnSale, type Product } from '@/lib/shop';
import { formatCents } from '@/lib/money';

const fmtDate = (ymd: string) =>
  new Date(`${ymd}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** Price with the sale treatment (struck-through regular price + end date) when a sale is active. */
export default function PriceTag({ product, size = 'md' }: { product: Product; size?: 'md' | 'lg' }) {
  const sale = isOnSale(product);
  const big = size === 'lg' ? 'text-3xl' : 'text-xl';
  return (
    <div>
      <p className={`${big} font-extrabold text-red-600`}>
        {formatCents(currentPriceCents(product))}
        {sale && <span className="ml-2 text-sm font-semibold text-gray-400 line-through">{formatCents(product.price_cents)}</span>}
        {product.price_note && <span className="text-xs font-semibold text-gray-500 ml-2">{product.price_note}</span>}
      </p>
      {sale && (
        <p className="mt-1 inline-block text-xs font-bold text-white bg-red-600 rounded-full px-2.5 py-0.5">
          SALE · ends {fmtDate(product.sale_ends_on)}
        </p>
      )}
    </div>
  );
}
