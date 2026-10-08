import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reviewApplicationAction } from '@/app/shop-admin/actions';
import { getApplication } from '@/lib/shop';
import { ALL_CLAUSES, ALL_FIELDS } from '@/lib/dojoForm';
import { Badge, Card, inputClass, primaryBtn, secondaryBtn } from '@/components/shop/ui';

export default async function AdminApplication({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = /^\d+$/.test(id) ? getApplication(Number(id)) : null;
  if (!app) notFound();

  const typedSig = app.signature.startsWith('typed:') ? app.signature.slice(6) : null;

  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/shop-admin/applications" className="text-sm font-semibold text-gray-600 hover:text-red-600">
        ← All applications
      </Link>
      <Card>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{app.dojo_name}</h1>
            <p className="text-sm text-gray-500">
              Submitted {app.created_at} UTC by {app.applicant_email}
            </p>
          </div>
          <Badge value={app.status} />
        </div>
        <dl className="divide-y divide-gray-100 text-sm">
          {ALL_FIELDS.filter((f) => app.data[f.name]).map((f) => (
            <div key={f.name} className="py-2.5 grid sm:grid-cols-3 gap-1 sm:gap-4">
              <dt className="text-gray-500 sm:col-span-1">{f.label}</dt>
              <dd className="sm:col-span-2 font-medium text-gray-900 whitespace-pre-line">{app.data[f.name]}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-gray-500 mt-4">
          Agreed to all {ALL_CLAUSES.length} agreement/certification clauses.
        </p>
        <div className="mt-4">
          <p className="text-sm font-bold text-gray-800 mb-1">eSignature</p>
          {typedSig ? (
            <p className="text-2xl italic font-serif border border-gray-200 rounded-lg px-4 py-3 inline-block">{typedSig}</p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={app.signature} alt="Chief instructor signature" className="border border-gray-200 rounded-lg bg-white max-h-40" />
          )}
        </div>
      </Card>

      <Card className="!p-5">
        <h2 className="font-bold text-gray-900 mb-3">Decision</h2>
        {app.admin_note && <p className="text-sm text-gray-600 mb-3">Previous note: {app.admin_note}</p>}
        <form className="space-y-3">
          <textarea name="note" rows={2} placeholder="Note to applicant (optional)" className={inputClass} defaultValue={app.admin_note} />
          <div className="flex gap-3">
            <button formAction={reviewApplicationAction.bind(null, app.id, 'approved')} className={primaryBtn}>
              Approve
            </button>
            <button formAction={reviewApplicationAction.bind(null, app.id, 'rejected')} className={secondaryBtn}>
              Reject
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-3">
          Approving unlocks the JKA/AF Club Membership in the shop for the applicant, with “{app.dojo_name}” as the club name.
        </p>
      </Card>
    </div>
  );
}
