'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { saveProductAction, type ProductPayload } from '@/app/shop-admin/actions';
import { choicesToText } from '@/lib/optionsText';
import type { Product } from '@/lib/shop';
import { Card, ErrorBox, Field, inputClass, primaryBtn, secondaryBtn } from '@/components/shop/ui';

type Opt = ProductPayload['options'][number];

export default function ProductForm({ product }: { product: Product | null }) {
  const [v, setV] = useState<ProductPayload>({
    id: product?.id ?? null,
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product ? (product.price_cents / 100).toFixed(2) : '',
    price_note: product?.price_note ?? '',
    sale_price: product?.sale_price_cents != null ? (product.sale_price_cents / 100).toFixed(2) : '',
    sale_ends_on: product?.sale_ends_on ?? '',
    image_url: product?.image_url ?? '',
    stock: product?.stock != null ? String(product.stock) : '',
    physical: product?.physical ?? false,
    free_shipping: product?.free_shipping ?? true,
    requires_dojo_approval: product?.requires_dojo_approval ?? false,
    active: product?.active ?? true,
    sort: String(product?.sort ?? 0),
    options:
      product?.options.map((o) => ({
        id: o.id,
        label: o.label,
        type: o.type,
        required: o.required,
        choicesText: choicesToText(o.choices),
      })) ?? [],
  });
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ProductPayload>(k: K, val: ProductPayload[K]) => setV((p) => ({ ...p, [k]: val }));
  const setOpt = (i: number, patch: Partial<Opt>) =>
    set('options', v.options.map((o, j) => (j === i ? { ...o, ...patch } : o)));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await saveProductAction(v);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <ErrorBox>{error}</ErrorBox>}
      <Card className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Name" required>
            <input value={v.name} onChange={(e) => set('name', e.target.value)} required className={inputClass} />
          </Field>
          <Field label="URL slug" hint="Leave blank to generate from the name.">
            <input value={v.slug} onChange={(e) => set('slug', e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Description">
          <textarea value={v.description} onChange={(e) => set('description', e.target.value)} rows={3} className={inputClass} />
        </Field>
        <div className="grid sm:grid-cols-4 gap-5">
          <Field label="Price (USD)" required>
            <input value={v.price} onChange={(e) => set('price', e.target.value)} inputMode="decimal" required className={inputClass} />
          </Field>
          <Field label="Price note" hint='e.g. "per year"'>
            <input value={v.price_note} onChange={(e) => set('price_note', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Stock quantity" hint="Blank = not tracked.">
            <input value={v.stock} onChange={(e) => set('stock', e.target.value)} inputMode="numeric" className={inputClass} />
          </Field>
          <Field label="Sort order">
            <input value={v.sort} onChange={(e) => set('sort', e.target.value)} inputMode="numeric" className={inputClass} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 rounded-xl bg-red-50/50 border border-red-100 p-4">
          <Field label="Sale price (USD)" hint="Leave blank for no sale.">
            <input value={v.sale_price} onChange={(e) => set('sale_price', e.target.value)} inputMode="decimal" className={inputClass} />
          </Field>
          <Field
            label="Sale ends on"
            hint="Sale price applies through the end of this day (Central time), then the regular price returns automatically."
          >
            <input type="date" value={v.sale_ends_on} onChange={(e) => set('sale_ends_on', e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Image link" hint="A https:// link, or a file in the site's public folder such as /jkaaf_logo.png.">
          <input value={v.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="https://..." className={inputClass} />
        </Field>
        <div className="flex flex-wrap gap-6 text-sm text-gray-800">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={v.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 accent-red-600" />
            Visible in shop
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={v.physical} onChange={(e) => set('physical', e.target.checked)} className="h-4 w-4 accent-red-600" />
            Physical item (needs a shipping address)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={v.free_shipping} onChange={(e) => set('free_shipping', e.target.checked)} className="h-4 w-4 accent-red-600" />
            Free shipping (untick if you charge for shipping, e.g. with a Delivery option)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={v.requires_dojo_approval}
              onChange={(e) => set('requires_dojo_approval', e.target.checked)}
              className="h-4 w-4 accent-red-600"
            />
            Requires an approved Dojo Membership application
          </label>
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Customer options</h2>
          <button
            type="button"
            className={secondaryBtn}
            onClick={() => set('options', [...v.options, { id: '', label: '', type: 'select', required: true, choicesText: '' }])}
          >
            Add option
          </button>
        </div>
        {v.options.length === 0 && <p className="text-sm text-gray-500">No options. Customers just choose a quantity.</p>}
        {v.options.map((o, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Label">
                <input value={o.label} onChange={(e) => setOpt(i, { label: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Type">
                <select value={o.type} onChange={(e) => setOpt(i, { type: e.target.value as Opt['type'] })} className={inputClass}>
                  <option value="select">Dropdown choices</option>
                  <option value="text">Free text</option>
                  <option value="club">Club name (from approved application)</option>
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-gray-800 sm:mt-7">
                <input type="checkbox" checked={o.required} onChange={(e) => setOpt(i, { required: e.target.checked })} className="h-4 w-4 accent-red-600" />
                Required
              </label>
            </div>
            {o.type === 'select' && (
              <Field
                label="Choices"
                hint="One per line: Label | extra price | flags. Flags (optional): recurring, noship. Example: Ship to me | 1.00"
              >
                <textarea
                  value={o.choicesText}
                  onChange={(e) => setOpt(i, { choicesText: e.target.value })}
                  rows={4}
                  className={`${inputClass} font-mono text-sm`}
                />
              </Field>
            )}
            <button
              type="button"
              onClick={() => set('options', v.options.filter((_, j) => j !== i))}
              className="text-sm font-semibold text-red-600 hover:underline cursor-pointer"
            >
              Remove option
            </button>
          </div>
        ))}
      </Card>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? 'Saving…' : 'Save product'}
        </button>
        <Link href="/shop-admin/products" className={secondaryBtn}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
