import { getUser } from '@/lib/auth';
import { ordersCsv } from '@/lib/shopAdmin';

export const dynamic = 'force-dynamic';

/** Downloads every order line as a CSV file. Owner only. */
export async function GET() {
  const user = await getUser();
  if (!user || user.role !== 'admin') return new Response('Forbidden', { status: 403 });
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(await ordersCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="jkaaf-orders-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
