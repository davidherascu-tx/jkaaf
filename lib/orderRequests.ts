import 'server-only';
import { query, queryOne, ts } from '@/lib/db';
import type { Order, OrderItem } from '@/lib/shop';

export type RequestType = 'cancel' | 'return' | 'refund';
export type RequestStatus = 'pending' | 'approved' | 'declined';

export const REQUEST_LABEL: Record<RequestType, string> = {
  cancel: 'Cancellation request',
  return: 'Return request',
  refund: 'Refund request',
};

export interface OrderRequest {
  id: number;
  order_id: number;
  user_id: number;
  type: RequestType;
  reason: string;
  status: RequestStatus;
  admin_note: string;
  created_at: string;
  resolved_at: string | null;
  customer_name?: string;
  customer_email?: string;
}

const toRequest = (r: Record<string, unknown>): OrderRequest => ({
  id: r.id as number,
  order_id: r.order_id as number,
  user_id: r.user_id as number,
  type: r.type as RequestType,
  reason: r.reason as string,
  status: r.status as RequestStatus,
  admin_note: r.admin_note as string,
  created_at: ts(r.created_at as Date),
  resolved_at: r.resolved_at ? ts(r.resolved_at as Date) : null,
  customer_name: r.first_name != null ? `${r.first_name} ${r.last_name}` : undefined,
  customer_email: (r.email as string | undefined) ?? undefined,
});

/**
 * What the customer can do with an order right now:
 *  - cancel_now:  unpaid order, they can cancel it themselves.
 *  - cancel:      paid but nothing shipped yet, they can ask for a cancellation.
 *  - return / refund: something was shipped or completed, they can ask for a return and / or a refund.
 * Nothing is offered while a request is already waiting, or for a cancelled order.
 */
export function orderActions(order: Pick<Order, 'status'>, items: Pick<OrderItem, 'fulfillment' | 'physical'>[], hasPending: boolean) {
  const none = { cancelNow: false, cancel: false, return: false, refund: false };
  if (order.status === 'cancelled') return none;
  if (order.status === 'awaiting_payment') return { ...none, cancelNow: true };
  if (hasPending) return none;
  const nothingShipped = items.every((i) => i.fulfillment === 'pending');
  if (nothingShipped) return { ...none, cancel: true };
  const shippedPhysical = items.some((i) => i.physical && i.fulfillment !== 'pending');
  return { ...none, return: shippedPhysical, refund: true };
}

export async function listOrderRequests(orderId: number): Promise<OrderRequest[]> {
  return (await query('select * from order_requests where order_id = $1 order by id desc', [orderId])).map(toRequest);
}

/** Creates a request. Returns an error message when the order already has one waiting. */
export async function createOrderRequest(opts: { orderId: number; userId: number; type: RequestType; reason: string }): Promise<{ id: number } | { error: string }> {
  const row = await queryOne(
    'insert into order_requests (order_id, user_id, type, reason) values ($1, $2, $3, $4) on conflict do nothing returning id',
    [opts.orderId, opts.userId, opts.type, opts.reason.slice(0, 1000)],
  );
  return row ? { id: row.id as number } : { error: 'This order already has a request waiting for review.' };
}

/** Requests still waiting for the shop owner, newest first. */
export async function listPendingRequests(): Promise<OrderRequest[]> {
  return (
    await query(
      `select r.*, u.first_name, u.last_name, u.email
         from order_requests r join users u on u.id = r.user_id
        where r.status = 'pending' order by r.id desc`,
    )
  ).map(toRequest);
}

export async function getOrderRequest(id: number): Promise<OrderRequest | null> {
  const r = await queryOne(
    `select r.*, u.first_name, u.last_name, u.email from order_requests r join users u on u.id = r.user_id where r.id = $1`,
    [id],
  );
  return r ? toRequest(r) : null;
}

/** Marks a waiting request approved / declined. Returns false when it was already handled. */
export async function resolveOrderRequest(id: number, status: 'approved' | 'declined', note: string): Promise<boolean> {
  const r = await queryOne(
    "update order_requests set status = $2, admin_note = $3, resolved_at = now() where id = $1 and status = 'pending' returning id",
    [id, status, note.slice(0, 1000)],
  );
  return !!r;
}
