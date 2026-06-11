import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteOrder, getOrder, getOrderSnapshots } from '../../api/orders';
import type { Order, OrderSnapshot } from '../../types/order';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDateTime, formatPrice } from '../../utils/format';

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [snapshots, setSnapshots] = useState<OrderSnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    Promise.all([getOrder(orderId), getOrderSnapshots(orderId)])
      .then(([orderData, snapshotData]) => {
        setOrder(orderData);
        setSnapshots(snapshotData);
      })
      .catch(() => setError('Failed to load order.'));
  }, [orderId]);

  if (error) return <p className="mx-auto max-w-2xl px-4 py-8 text-red-700">{error}</p>;
  if (!order) return <p className="mx-auto max-w-2xl px-4 py-8 text-gray-600">Loading order...</p>;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteOrder(order.id);
      navigate('/orders');
    } catch {
      setError('Failed to delete order.');
      setDeleting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order {order.id.slice(0, 8)}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Placed {formatDateTime(order.created_at)} &middot; Delivery to {order.delivery_address}
      </p>
      <p className="mt-1 text-sm">
        <Link to={`/orders/${order.id}/payments`} className="text-blue-600 hover:underline">
          View Payments
        </Link>
      </p>
      <h2 className="mt-6 text-xl font-semibold">Items</h2>
      <ul className="mt-2 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white px-4 shadow-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between py-2 text-sm">
            <span>
              {item.quantity} &times; {item.name}
            </span>
            <span>{formatPrice(item.quantity * item.unit_price)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-right">
        <strong>Total: {formatPrice(order.total_amount)}</strong>
      </p>
      <h2 className="mt-6 text-xl font-semibold">History</h2>
      {snapshots.length === 0 && <p className="mt-2 text-gray-600">No history yet.</p>}
      <ol className="mt-2 border-l-2 border-gray-200">
        {snapshots.map((snapshot) => (
          <li key={snapshot.id} className="py-2 pl-4">
            <StatusBadge status={snapshot.status} />
            <span className="ml-2 text-sm text-gray-600">{formatDateTime(snapshot.created_at)}</span>
          </li>
        ))}
      </ol>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="mt-6 rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? 'Deleting...' : 'Delete order'}
      </button>
    </main>
  );
}
