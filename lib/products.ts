// Product types, pricing helpers and the starter catalogue.
// Products are managed in the browser at /shop-admin/products; SEED only fills an empty database.

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

interface ProductDef {
  id?: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  priceNote?: string;
  image?: string;
  sale?: { price: number; endsOn: string };
  /** Needs a shipping address at checkout. */
  physical?: boolean;
  /** Defaults to true. */
  freeShipping?: boolean;
  /** Locked until the customer has an approved Dojo Membership application. */
  requiresDojoApproval?: boolean;
  active?: boolean;
  options?: {
    id: string;
    label: string;
    type: 'select' | 'text' | 'club';
    required?: boolean;
    choices?: { label: string; extra?: number; recurring?: boolean; noShip?: boolean }[];
  }[];
}

const DEFS: ProductDef[] = [
  {
    slug: 'renewal-fee-qualifications',
    name: 'Renewal Fee - Qualifications',
    description: 'Qualification renewal. Levels D, C, B, and A.',
    price: 114,
    image: '/jkaaf_logo.png',
    // sale: { price: 99, endsOn: '2026-12-31' },
    options: [
      {
        id: 'license',
        label: 'License selection',
        type: 'select',
        choices: [{ label: 'None' }, { label: 'Instructor' }, { label: 'Judge' }, { label: 'Examiner' }],
      },
    ],
  },
  {
    slug: 'jkaaf-patch',
    name: 'JKA/AF Patch',
    description: 'Official JKA/AF patch.',
    price: 5,
    priceNote: '$6 if shipped',
    image: '/jkaaf_logo.png',
    physical: true,
    freeShipping: false,
    options: [
      {
        id: 'delivery',
        label: 'Delivery',
        type: 'select',
        choices: [{ label: 'Pick up (no shipping)', noShip: true }, { label: 'Ship to me (shipping fee)', extra: 1 }],
      },
    ],
  },
  {
    slug: 'jkaaf-passport',
    name: 'JKA/AF Passport',
    description: 'Passport - for members of JKA/AF only.',
    price: 30,
    image: '/jkaaf_logo.png',
    physical: true,
  },
  {
    slug: 'jkaaf-club-membership',
    name: 'JKA/AF Club Membership',
    description:
      'Price per year. Before paying dues, please complete the Dojo Membership application. The club name is chosen from your approved application.',
    price: 140,
    priceNote: 'per year',
    image: '/jkaaf_logo.png',
    requiresDojoApproval: true,
    options: [
      { id: 'club', label: 'Club name', type: 'club' },
      {
        id: 'billing',
        label: 'Purchase option',
        type: 'select',
        choices: [
          { label: 'One-time purchase' },
          { label: 'Yearly Club - every year until canceled', recurring: true },
        ],
      },
    ],
  },
];

const toCents = (dollars: number) => Math.round(dollars * 100);

export const SEED: ProductInput[] = DEFS.map((p, i) => ({
  slug: p.slug,
  name: p.name,
  description: p.description,
  price_cents: toCents(p.price),
  price_note: p.priceNote ?? '',
  image_url: p.image ?? '',
  sale_price_cents: p.sale ? toCents(p.sale.price) : null,
  sale_ends_on: p.sale?.endsOn ?? '',
  physical: !!p.physical,
  requires_dojo_approval: !!p.requiresDojoApproval,
  active: p.active !== false,
  sort: i,
  free_shipping: p.freeShipping !== false,
  stock: null,
  options: (p.options ?? []).map((o) => ({
    id: o.id,
    label: o.label,
    type: o.type,
    required: o.required !== false,
    choices: o.choices?.map((c) => ({
      label: c.label,
      priceCents: toCents(c.extra ?? 0),
      ...(c.recurring ? { recurring: true } : {}),
      ...(c.noShip ? { noShip: true } : {}),
    })),
  })),
}));

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

