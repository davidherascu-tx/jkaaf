import { getUser } from '@/lib/auth';
import { exportAll } from '@/lib/backup';

export const dynamic = 'force-dynamic';

/** Downloads a full backup of the shop data as one JSON file. Admin only. */
export async function GET() {
  const user = await getUser();
  if (!user || user.role !== 'admin') return new Response('Forbidden', { status: 403 });
  const file = await exportAll();
  const stamp = file.exportedAt.slice(0, 16).replace('T', '_').replace(':', '-');
  return new Response(JSON.stringify(file), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="jkaaf-backup-${stamp}.json"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
