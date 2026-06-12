import { useEffect, useState } from 'react';
import {
  acceptOrder,
  getMyRestaurant,
  getPendingOrders,
  rejectOrder,
} from '../../api/restaurants';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import type { PendingOrder, Restaurant } from '../../types/restaurant';
import { formatDateTime, formatPrice } from '../../utils/format';

interface DashboardData {
  restaurant: Restaurant;
  pendingOrders: PendingOrder[];
}

export default function RestaurantDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [restaurant, pendingOrders] = await Promise.all([
          getMyRestaurant(),
          getPendingOrders(),
        ]);
        if (!cancelled) {
          setData({ restaurant, pendingOrders });
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load your restaurant dashboard.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const retry = () => {
    setError(null);
    setActionError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const refreshPendingOrders = async () => {
    const pendingOrders = await getPendingOrders();
    setData((current) => (current === null ? current : { ...current, pendingOrders }));
  };

  const handleAccept = async (orderId: string) => {
    setActionOrderId(orderId);
    setActionError(null);
    try {
      await acceptOrder(orderId);
      await refreshPendingOrders();
    } catch {
      setActionError('Failed to accept order.');
    } finally {
      setActionOrderId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = window.prompt('Reason for rejecting this order?');
    if (reason === null || reason.trim() === '') return;

    setActionOrderId(orderId);
    setActionError(null);
    try {
      await rejectOrder(orderId, reason.trim());
      await refreshPendingOrders();
    } catch {
      setActionError('Failed to reject order.');
    } finally {
      setActionOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <LoadingState title="Loading restaurant data" message="Fetching restaurant information." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
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

  if (data === null) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          message="Restaurant dashboard data was unavailable."
          action={
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const { restaurant, pendingOrders } = data;
  const actionInProgress = actionOrderId !== null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Restaurant Dashboard &middot; {restaurant.isOpen ? 'Open' : 'Closed'} &middot;{' '}
            {restaurant.isAvailable ? 'Available' : 'Unavailable'}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={retry} disabled={actionInProgress}>
          Refresh
        </Button>
      </div>

      {actionError && (
        <p className="mt-4 text-sm font-medium text-red-700" role="alert">{actionError}</p>
      )}

      <h2 className="mt-8 text-lg font-semibold">Pending orders</h2>

      {pendingOrders.length === 0 ? (
        <Card className="mt-4 text-center">
          <p className="text-slate-600">No pending orders</p>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4">
          {pendingOrders.map((order) => (
            <Card as="article" key={order.orderId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Order {order.orderId.slice(0, 8)}</h3>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    {order.status}
                  </span>
                </div>
              </CardHeader>

              <dl className="grid gap-2 text-sm">
                <div className="flex items-baseline gap-2">
                  <dt className="font-medium text-slate-500">Order ID</dt>
                  <dd className="text-slate-800">{order.orderId}</dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="font-medium text-slate-500">Amount</dt>
                  <dd className="text-slate-800">{formatPrice(order.amount)}</dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="font-medium text-slate-500">Created</dt>
                  <dd className="text-slate-800">
                    {order.createdAt === null ? '\u2014' : formatDateTime(order.createdAt)}
                  </dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="font-medium text-slate-500">Customer</dt>
                  <dd className="text-slate-800">{order.customerId}</dd>
                </div>
              </dl>

              <div className="mt-4 flex gap-3">
                <Button
                  size="sm"
                  onClick={() => handleAccept(order.orderId)}
                  disabled={actionInProgress}
                >
                  {actionOrderId === order.orderId ? 'Accepting…' : 'Accept'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleReject(order.orderId)}
                  disabled={actionInProgress}
                >
                  {actionOrderId === order.orderId ? 'Rejecting…' : 'Reject'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
