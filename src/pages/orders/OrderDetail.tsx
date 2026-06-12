import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteOrder, getOrder, getOrderSnapshots } from '../../api/orders';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { SagaTimeline } from '../../components/ui/SagaTimeline';
import StatusBadge from '../../components/ui/StatusBadge';
import { useNotificationContext } from '../../context/useNotificationContext';
import type { Order, OrderSnapshot } from '../../types/order';
import { formatDateTime, formatPrice } from '../../utils/format';

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { notifications } = useNotificationContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [snapshots, setSnapshots] = useState<OrderSnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const orderNotifications = notifications.filter((n) => n.order_id === orderId);

  const loadOrder = useCallback(() => {
    if (!orderId) return;
    Promise.all([getOrder(orderId), getOrderSnapshots(orderId)])
      .then(([orderData, snapshotData]) => {
        setOrder(orderData);
        setSnapshots(snapshotData);
      })
      .catch(() => setError('Failed to load order.'));
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (orderNotifications.length > 0) loadOrder();
  }, [orderNotifications.length, loadOrder]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState
          message={error}
          action={
            <Button variant="secondary" onClick={loadOrder}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl">
        <LoadingState title="Loading order" message="Fetching order details and saga history." />
      </div>
    );
  }

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
    <div className="mx-auto grid max-w-2xl gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Order {order.id.slice(0, 8)}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-slate-500">
            Placed {formatDateTime(order.created_at)} &middot; Delivery to{' '}
            {order.delivery_address}
          </p>
        </CardHeader>

        <h2 className="text-lg font-semibold">Items</h2>
        <ul className="mt-2 divide-y divide-slate-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span>
                {item.quantity} &times; {item.name}
              </span>
              <span className="font-medium">{formatPrice(item.quantity * item.unit_price)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-lg font-bold">
          Total: {formatPrice(order.total_amount)}
        </p>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Saga Timeline</h2>
          <p className="text-sm text-slate-500">
            Order lifecycle — snapshots and live events
          </p>
        </CardHeader>
        <SagaTimeline
          snapshots={snapshots}
          notifications={orderNotifications}
          currentStatus={order.status}
        />
      </Card>

      <div className="flex items-center gap-3">
        <ButtonLink to={`/orders/${order.id}/payments`} variant="secondary" size="sm">
          View payments
        </ButtonLink>
        <ButtonLink to="/orders" variant="ghost" size="sm">
          Back to orders
        </ButtonLink>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete order'}
        </Button>
      </div>
    </div>
  );
}
