import { useEffect, useState } from 'react';
import { listCustomerOrders } from '../../api/orders';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/useAuth';
import type { Order } from '../../types/order';
import { formatDateTime, formatPrice } from '../../utils/format';

export default function OrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    listCustomerOrders(user.id)
      .then(setOrders)
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [user, reloadKey]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <LoadingState title="Loading orders" message="Fetching your order history." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState
          message={error}
          action={
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders.length === 0 ? (
        <Card className="mt-6 text-center">
          <p className="text-slate-600">You haven&rsquo;t placed any orders yet.</p>
          <div className="mt-4">
            <ButtonLink to="/restaurants">Browse restaurants</ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4">
          {orders.map((order) => (
            <Card as="article" key={order.id}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Order {order.id.slice(0, 8)}</h2>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {formatDateTime(order.created_at)} &middot; Total:{' '}
                <span className="font-medium text-slate-800">{formatPrice(order.total_amount)}</span>
              </p>
              <div className="mt-4">
                <ButtonLink to={`/orders/${order.id}`} variant="secondary" size="sm">
                  View details
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
