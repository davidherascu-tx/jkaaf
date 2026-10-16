import { getUser } from '@/lib/auth';
import { importAll, validateBackup, type BackupFile } from '@/lib/backup';
import { allow } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 50 * 1024 * 1024;

/**
 * Restores a backup file, replacing all shop data. Admin only, and the admin must type RESTORE to confirm.
 * (This is a route and not a Server Action so large files are allowed.)
 */
export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.role !== 'admin') return Response.json({ ok: false, error: 'Forbidden' }, { status: 403 });

  // A request from another website must never be able to wipe the data (the sign-in cookie is already SameSite=Lax; this is a second lock).
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) return Response.json({ ok: false, error: 'Forbidden' }, { status: 403 });

  if (!(await allow('restore:' + user.id, 5, 3600))) return Response.json({ ok: false, error: 'Too many attempts. Try again later.' }, { status: 429 });

  const form = await request.formData();
  if (String(form.get('confirm') ?? '').trim() !== 'RESTORE') return Response.json({ ok: false, error: 'Type RESTORE to confirm.' }, { status: 400 });
  const upload = form.get('file');
  if (!(upload instanceof File) || upload.size === 0) return Response.json({ ok: false, error: 'Choose a backup file.' }, { status: 400 });
  if (upload.size > MAX_BYTES) return Response.json({ ok: false, error: 'That file is too large.' }, { status: 413 });

  let parsed: unknown;
  try {
    parsed = JSON.parse(await upload.text());
  } catch {
    return Response.json({ ok: false, error: 'That file is not a valid backup (it is not readable JSON).' }, { status: 400 });
  }
  const bad = validateBackup(parsed);
  if (bad) return Response.json({ ok: false, error: bad }, { status: 400 });

  const result = await importAll(parsed as BackupFile);
  return Response.json(result, { status: result.ok ? 200 : 500 });
}
