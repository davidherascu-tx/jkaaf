'use client';

import { useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ErrorBox, inputClass, Notice } from '@/components/shop/ui';

const LABELS: Record<string, string> = {
  users: 'accounts',
  products: 'products',
  addresses: 'addresses',
  orders: 'orders',
  order_items: 'order items',
  payments: 'payments',
  refunds: 'refunds',
  dojo_applications: 'dojo applications',
  cart_items: 'cart items',
};

/** Upload a backup file and restore it. Replaces everything, so it asks for the word RESTORE. */
export default function RestoreForm() {
  const [file, setFile] = useState<File | null>(null);
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<Record<string, number> | null>(null);

  const [ask, setAsk] = useState(false);

  async function restore() {
    if (!file) return;
    setAsk(false);
    setBusy(true);
    setError('');
    setDone(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('confirm', confirm);
    try {
      const res = await fetch('/admin/backup/import', { method: 'POST', body: fd });
      const data = (await res.json()) as { ok: boolean; error?: string; counts?: Record<string, number> };
      if (data.ok && data.counts) setDone(data.counts);
      else setError(data.error ?? 'The restore failed.');
    } catch {
      setError('Could not reach the server. Nothing was changed.');
    }
    setBusy(false);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (file) setAsk(true);
      }}
      className="space-y-4 max-w-xl"
    >
      <ConfirmDialog
        open={ask}
        title="Replace all shop data?"
        confirmLabel="Yes, restore backup"
        cancelLabel="Go back"
        onCancel={() => setAsk(false)}
        onConfirm={restore}
      >
        <p>
          All current customers, orders, subscriptions, payments and applications will be <strong>replaced</strong> with the contents of{' '}
          <strong>{file?.name}</strong>.
        </p>
        <p className="font-semibold text-red-700">Everyone, including you, will be signed out. This cannot be undone.</p>
      </ConfirmDialog>
      {error && <ErrorBox>{error}</ErrorBox>}
      {done && (
        <Notice tone="ok">
          <p className="font-bold mb-1">Backup restored.</p>
          <p>
            {Object.entries(done)
              .map(([t, n]) => `${n} ${LABELS[t] ?? t}`)
              .join(' · ')}
          </p>
          <p className="mt-2">Everyone was signed out, including you. <a className="font-bold underline" href="/admin/login">Sign in again</a>.</p>
        </Notice>
      )}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">Backup file (.json)</label>
        <input
          type="file"
          accept="application/json,.json"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-semibold file:text-gray-800 hover:file:bg-gray-200"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          Type <span className="font-mono text-red-600">RESTORE</span> to confirm
        </label>
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" className={`${inputClass} !w-48`} />
      </div>
      <button
        disabled={!file || confirm.trim() !== 'RESTORE' || busy}
        className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {busy ? 'Restoring…' : 'Restore backup'}
      </button>
    </form>
  );
}
