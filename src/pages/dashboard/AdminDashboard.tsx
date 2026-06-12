import { useEffect, useState } from 'react';
import { listOrders } from '../../api/orders';
import { listPayments } from '../../api/payments';
import type { Order } from '../../types/order';
import type { Payment } from '../../types/payment';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDateTime, formatPrice } from '../../utils/format';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listOrders(), listPayments()])
      .then(([orderData, paymentData]) => {
        setOrders(orderData);
        setPayments(paymentData);
      })
      .catch(() => setError('Failed to load admin overview.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="mx-auto max-w-3xl text-slate-600">Loading overview...</p>;
  }
  if (error) {
    return <p className="mx-auto max-w-3xl text-red-700">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Total Orders</p>
          <p className="text-3xl font-bold">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Total Payments</p>
          <p className="text-3xl font-bold">{payments.length}</p>
        </div>
      </div>
      <h2 className="mt-8 text-xl font-semibold">Orders</h2>
      {orders.length === 0 && <p className="mt-2 text-slate-600">No orders.</p>}
      <ul className="mt-2 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
        {orders.map((order) => (
          <li key={order.id} className="flex items-center justify-between py-2 text-sm">
            <span>
              Order {order.id.slice(0, 8)} &middot; {formatDateTime(order.created_at)} &middot;{' '}
              {formatPrice(order.total_amount)}
            </span>
            <StatusBadge status={order.status} />
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-xl font-semibold">Payments</h2>
      {payments.length === 0 && <p className="mt-2 text-slate-600">No payments.</p>}
      <ul className="mt-2 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
        {payments.map((payment) => (
          <li key={payment.id} className="flex items-center justify-between py-2 text-sm">
            <span>
              Payment {payment.id.slice(0, 8)} &middot; Order {payment.order_id.slice(0, 8)}{' '}
              &middot; {formatPrice(payment.amount)}
            </span>
            <span className="font-medium">{payment.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
