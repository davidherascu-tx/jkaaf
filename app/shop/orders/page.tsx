import { redirect } from 'next/navigation';

/** Orders now live in the account dashboard. */
export default function OrdersPage() {
  redirect('/account/orders');
}
