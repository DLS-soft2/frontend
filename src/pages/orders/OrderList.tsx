import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCustomerOrders } from '../../api/orders';
import { useAuth } from '../../context/useAuth';
import type { Order } from '../../types/order';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDateTime, formatPrice } from '../../utils/format';

export default function OrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listCustomerOrders(user.id)
      .then(setOrders)
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="mx-auto max-w-2xl px-4 py-8 text-gray-600">Loading orders...</p>;
  if (error) return <p className="mx-auto max-w-2xl px-4 py-8 text-red-700">{error}</p>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders.length === 0 && (
        <p className="mt-4 text-gray-600">
          No orders yet.{' '}
          <Link to="/restaurants" className="text-blue-600 hover:underline">
            Browse restaurants
          </Link>{' '}
          to place one.
        </p>
      )}
      <ul className="mt-6 grid gap-3">
        {orders.map((order) => (
          <li
            key={order.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <Link to={`/orders/${order.id}`} className="font-bold text-blue-600 hover:underline">
                Order {order.id.slice(0, 8)}
              </Link>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {formatDateTime(order.created_at)} &middot; Total: {formatPrice(order.total_amount)}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
