import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder, getOrderSnapshots } from '../../api/orders';
import { getDeliveryReceipt, type DeliveryReceipt as DeliveryReceiptType } from '../../api/receipts';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { DeliveryReceipt } from '../../components/ui/DeliveryReceipt';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { SagaTimeline } from '../../components/ui/SagaTimeline';
import StatusBadge from '../../components/ui/StatusBadge';
import { useNotificationContext } from '../../context/useNotificationContext';
import type { Order, OrderSnapshot } from '../../types/order';
import { formatDateTime, formatPrice } from '../../utils/format';

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { notifications } = useNotificationContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [snapshots, setSnapshots] = useState<OrderSnapshot[]>([]);
  const [receipt, setReceipt] = useState<DeliveryReceiptType | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (order?.status === 'DELIVERED' && orderId) {
      getDeliveryReceipt(orderId).then(setReceipt);
    }
  }, [order?.status, orderId]);

  if (error) {
    return (
      <ErrorState
        message={error}
        action={
          <Button variant="secondary" onClick={loadOrder}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!order) {
    return <LoadingState title="Loading order" message="Fetching order details and status history." />;
  }

  return (
    <div>
      <PageHeader title={`Order ${order.id.slice(0, 8)}`}>
        <StatusBadge status={order.status} />
      </PageHeader>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left column: Order info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Order Details</h2>
            <p className="text-sm text-slate-500">
              Placed {formatDateTime(order.created_at)} &middot; Delivery to{' '}
              {order.delivery_address}
            </p>
          </CardHeader>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Items</h3>
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
          <p className="mt-4 border-t border-slate-100 pt-3 text-right text-lg font-bold">
            Total: {formatPrice(order.total_amount)}
          </p>
        </Card>

        {/* Right column: Order Status */}
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h2 className="text-lg font-semibold text-indigo-900">Order Status</h2>
            </div>
          </CardHeader>
          <SagaTimeline
            snapshots={snapshots}
            notifications={orderNotifications}
            currentStatus={order.status}
          />
        </Card>
      </div>

      {receipt && (
        <div className="mt-6">
          <DeliveryReceipt receipt={receipt} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ButtonLink to={`/orders/${order.id}/payments`} variant="secondary" size="sm">
          View payments
        </ButtonLink>
        <ButtonLink to="/orders" variant="ghost" size="sm">
          Back to orders
        </ButtonLink>
      </div>
    </div>
  );
}
