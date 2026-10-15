import { getUser } from '@/lib/auth';
import { buildInvoicePdf } from '@/lib/invoicePdf';
import { getOrder } from '@/lib/shop';

export const dynamic = 'force-dynamic';

/** Downloads the invoice (unpaid) or receipt (paid) PDF. Only the order's owner or an admin can get it. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return new Response('Please sign in.', { status: 401 });
  const found = /^\d+$/.test(id) ? await getOrder(Number(id)) : null;
  if (!found || (found.order.user_id !== user.id && user.role !== 'admin')) return new Response('Not found', { status: 404 });

  const { order, items } = found;
  const pdf = await buildInvoicePdf(order, items);
  const kind = 'invoice';
  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="jkaaf-${kind}-order-${order.id}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
