import 'server-only';
import { query } from '@/lib/db';

export type AddressKind = 'billing' | 'shipping';
export interface Address {
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export async function getAddresses(userId: number): Promise<Record<AddressKind, Address | null>> {
  const rows = await query('select * from addresses where user_id = $1', [userId]);
  const out: Record<AddressKind, Address | null> = { billing: null, shipping: null };
  for (const r of rows) {
    out[r.kind as AddressKind] = {
      name: r.name as string,
      line1: r.line1 as string,
      city: r.city as string,
      state: r.state as string,
      zip: r.zip as string,
      phone: r.phone as string,
    };
  }
  return out;
}

export async function saveAddress(userId: number, kind: AddressKind, a: Address) {
  await query(
    `insert into addresses (user_id, kind, name, line1, city, state, zip, phone) values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (user_id, kind) do update set name = $3, line1 = $4, city = $5, state = $6, zip = $7, phone = $8`,
    [userId, kind, a.name, a.line1, a.city, a.state, a.zip, a.phone],
  );
}

/** Shipping and billing are the same place (ignores case, spacing and phone). */
export const sameAddress = (a: Address | null, b: Address | null): boolean =>
  !!a && !!b && (['name', 'line1', 'city', 'state', 'zip'] as const).every((k) => a[k].trim().toLowerCase() === b[k].trim().toLowerCase());
