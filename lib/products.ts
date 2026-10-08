// Product types and pricing helpers (safe to import from client components).
// Products themselves live in the database and are managed at /shop-admin/products.

export interface Choice {
  label: string;
  priceCents: number;
  recurring?: boolean;
  noShip?: boolean;
}
export interface ProductOption {
  id: string;
  label: string;
  type: 'select' | 'text' | 'club';
  required: boolean;
  choices?: Choice[];
}
export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  price_note: string;
  image_url: string;
  sale_price_cents: number | null;
  /** Last day (YYYY-MM-DD, Central time) the sale price applies. */
  sale_ends_on: string;
  options: ProductOption[];
  physical: boolean;
  requires_dojo_approval: boolean;
  active: boolean;
  sort: number;
  /** False when shipping is charged on this product (shown to shoppers; the fee is a choice price). */
  free_shipping: boolean;
  /** Units in stock; null = not tracked (unlimited). */
  stock: number | null;
}

export type ProductInput = Omit<Product, 'id'>;

/** Today's date (YYYY-MM-DD) in the association's timezone. */
export function todayCentral(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date());
}

/** The sale price applies through the whole of its end date. */
export function isOnSale(p: Pick<Product, 'sale_price_cents' | 'sale_ends_on'>): boolean {
  return p.sale_price_cents !== null && !!p.sale_ends_on && todayCentral() <= p.sale_ends_on;
}

export function currentPriceCents(p: Product): number {
  return isOnSale(p) ? (p.sale_price_cents as number) : p.price_cents;
}

