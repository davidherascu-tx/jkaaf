'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseDollars } from '@/lib/money';
import { textToChoices } from '@/lib/optionsText';
import {
  deleteProduct,
  ORDER_STATUSES,
  reviewApplication,
  saveProduct,
  setOrderStatus,
  setStock,
  setUserStatus,
  type Order,
  type ProductOption,
} from '@/lib/shop';

// Every action re-checks admin; page/layout checks alone don't protect Server Functions.

export interface ProductPayload {
  id: number | null;
  name: string;
  slug: string;
  description: string;
  price: string;
  price_note: string;
  sale_price: string;
  sale_ends_on: string;
  image_url: string;
  /** Blank = stock is not tracked. */
  stock: string;
  physical: boolean;
  free_shipping: boolean;
  requires_dojo_approval: boolean;
  active: boolean;
  sort: string;
  options: { id: string; label: string; type: 'select' | 'text' | 'club'; required: boolean; choicesText: string }[];
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function saveProductAction(p: ProductPayload): Promise<{ error: string } | undefined> {
  await requireAdmin();

  const name = p.name.trim();
  const slug = slugify(p.slug || name);
  const cents = parseDollars(p.price);
  if (!name) return { error: 'Name is required.' };
  if (!slug) return { error: 'Slug is required.' };
  if (cents === null) return { error: 'Price must be a dollar amount like 114 or 114.00.' };

  const salePrice = p.sale_price.trim() ? parseDollars(p.sale_price) : null;
  if (p.sale_price.trim() && salePrice === null) return { error: 'Sale price must be a dollar amount like 99 or 99.00.' };
  if (salePrice !== null && !/^\d{4}-\d{2}-\d{2}$/.test(p.sale_ends_on)) return { error: 'Choose the date the sale ends.' };
  if (salePrice !== null && salePrice >= cents) return { error: 'The sale price must be lower than the regular price.' };

  const image = p.image_url.trim();
  if (image && !/^(https?:\/\/|\/(?!\/))/.test(image)) {
    return { error: 'Image must be a link starting with https:// or a /file in the public folder.' };
  }

  let stock: number | null = null;
  if (p.stock.trim()) {
    if (!/^\d{1,6}$/.test(p.stock.trim())) return { error: 'Stock must be a whole number, or blank if not tracked.' };
    stock = parseInt(p.stock, 10);
  }

  const options: ProductOption[] = [];
  const seen = new Set<string>();
  for (const o of p.options) {
    const label = o.label.trim();
    if (!label) return { error: 'Every option needs a label.' };
    let id = slugify(o.id || label) || 'option';
    while (seen.has(id)) id += '-2';
    seen.add(id);
    const base = { id, label, type: o.type, required: o.required };
    if (o.type === 'select') {
      const choices = textToChoices(o.choicesText);
      if ('error' in choices) return { error: `${label}: ${choices.error}` };
      if (choices.length === 0) return { error: `${label}: add at least one choice.` };
      options.push({ ...base, choices });
    } else {
      options.push(base);
    }
  }

  const clash = db().prepare('SELECT id FROM products WHERE slug = ? AND id IS NOT ?').get(slug, p.id);
  if (clash) return { error: 'Another product already uses that slug.' };

  saveProduct(p.id, {
    name,
    slug,
    description: p.description.trim(),
    price_cents: cents,
    price_note: p.price_note.trim(),
    image_url: image,
    sale_price_cents: salePrice,
    sale_ends_on: salePrice === null ? '' : p.sale_ends_on,
    stock,
    options,
    physical: p.physical,
    free_shipping: p.free_shipping,
    requires_dojo_approval: p.requires_dojo_approval,
    active: p.active,
    sort: parseInt(p.sort, 10) || 0,
  });
  revalidatePath('/shop', 'layout');
  redirect('/shop-admin/products');
}

export async function toggleProductAction(id: number, active: boolean) {
  await requireAdmin();
  db().prepare('UPDATE products SET active = ? WHERE id = ?').run(active ? 1 : 0, id);
  revalidatePath('/shop', 'layout');
  revalidatePath('/shop-admin/products');
}

export async function deleteProductAction(id: number) {
  await requireAdmin();
  deleteProduct(id);
  revalidatePath('/shop', 'layout');
  revalidatePath('/shop-admin/products');
}

/** Quick stock update from the products list. Blank = stop tracking. */
export async function setStockAction(id: number, fd: FormData) {
  await requireAdmin();
  const raw = String(fd.get('stock') ?? '').trim();
  if (raw === '') setStock(id, null);
  else if (/^\d{1,6}$/.test(raw)) setStock(id, parseInt(raw, 10));
  revalidatePath('/shop', 'layout');
  revalidatePath('/shop-admin/products');
}

export async function setOrderStatusAction(id: number, status: string) {
  await requireAdmin();
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return;
  setOrderStatus(id, status as Order['status']);
  revalidatePath('/shop-admin', 'layout');
  revalidatePath('/shop', 'layout');
}

export async function setUserStatusAction(id: number, status: string) {
  const admin = await requireAdmin();
  if (id === admin.id) return;
  if (db().prepare("SELECT 1 FROM users WHERE id = ? AND role = 'admin'").get(id)) return;
  if (status !== 'approved' && status !== 'rejected' && status !== 'pending') return;
  setUserStatus(id, status);
  revalidatePath('/shop-admin', 'layout');
}

export async function reviewApplicationAction(id: number, status: 'approved' | 'rejected', fd: FormData) {
  await requireAdmin();
  if (status !== 'approved' && status !== 'rejected') return;
  reviewApplication(id, status, String(fd.get('note') ?? '').trim().slice(0, 1000));
  revalidatePath('/shop-admin', 'layout');
  redirect('/shop-admin/applications');
}
