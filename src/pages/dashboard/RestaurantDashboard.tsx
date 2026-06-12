import { useEffect, useState } from 'react';
import {
  acceptOrder,
  getMyRestaurant,
  getPendingOrders,
  rejectOrder,
} from '../../api/restaurants';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import type { PendingOrder, Restaurant } from '../../types/restaurant';
import { formatDateTime, formatPrice } from '../../utils/format';

interface DashboardData {
  restaurant: Restaurant;
  pendingOrders: PendingOrder[];
}

type DashboardState =
  | { kind: 'loading' }
  | { kind: 'no-restaurant' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: DashboardData };

function extractHttpStatus(err: unknown): number {
  if (
    err !== null &&
    typeof err === 'object' &&
    'response' in err &&
    err.response !== null &&
    typeof err.response === 'object' &&
    'status' in err.response
  ) {
    return (err.response as { status: number }).status;
  }
  return 0;
}

export default function RestaurantDashboard() {
  const [state, setState] = useState<DashboardState>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [restaurant, pendingOrders] = await Promise.all([
          getMyRestaurant(),
          getPendingOrders(),
        ]);
        if (!cancelled) {
          setState({ kind: 'ready', data: { restaurant, pendingOrders } });
        }
      } catch (err: unknown) {
        if (cancelled) return;
        if (extractHttpStatus(err) === 404) {
          setState({ kind: 'no-restaurant' });
        } else {
          setState({ kind: 'error', message: 'Failed to load your restaurant dashboard.' });
        }
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const retry = () => {
    setActionError(null);
    setState({ kind: 'loading' });
    setReloadKey((k) => k + 1);
  };

  const refreshPendingOrders = async () => {
    const pendingOrders = await getPendingOrders();
    setState((current) => (current.kind === 'ready' ? { ...current, data: { ...current.data, pendingOrders } } : current));
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

  const openRejectModal = (orderId: string) => {
    setRejectingOrderId(orderId);
    setRejectReason('');
  };

  const closeRejectModal = () => {
    setRejectingOrderId(null);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (rejectingOrderId === null || rejectReason.trim() === '') return;

    const orderId = rejectingOrderId;
    closeRejectModal();
    setActionOrderId(orderId);
    setActionError(null);
    try {
      await rejectOrder(orderId, rejectReason.trim());
      await refreshPendingOrders();
    } catch {
      setActionError('Failed to reject order.');
    } finally {
      setActionOrderId(null);
    }
  };

  if (state.kind === 'loading') {
    return <LoadingState title="Loading restaurant data" message="Fetching restaurant information." />;
  }

  if (state.kind === 'error') {
    return (
      <ErrorState
        message={state.message}
        action={
          <Button variant="secondary" onClick={retry}>
            Try again
          </Button>
        }
      />
    );
  }

  if (state.kind === 'no-restaurant') {
    return (
      <div>
        <PageHeader title="Restaurant Dashboard" />
        <div className="mt-6">
          <ErrorState
            title="Restaurant not linked"
            message="Your restaurant hasn't been linked to your account yet. Please contact an administrator to get started."
            action={
              <Button variant="secondary" onClick={retry}>
                Try again
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const { restaurant, pendingOrders } = state.data;
  const actionInProgress = actionOrderId !== null;

  return (
    <div>
      <PageHeader title={restaurant.name}>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${restaurant.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </span>
          <Button variant="secondary" size="sm" onClick={retry} disabled={actionInProgress}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </Button>
        </div>
      </PageHeader>

      <div className="mt-6">
        <div className="inline-block rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm border-l-3 border-l-amber-500">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{pendingOrders.length}</p>
        </div>
      </div>

      {actionError && (
        <p className="mt-4 text-sm font-medium text-red-700" role="alert">{actionError}</p>
      )}

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Pending Orders</h2>

      {pendingOrders.length === 0 ? (
        <Card className="text-center">
          <p className="text-slate-600">No pending orders</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pendingOrders.map((order) => (
            <Card as="article" key={order.orderId} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{order.orderId.slice(0, 8)}</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  {order.status}
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-[80px_1fr] gap-x-2 gap-y-1.5 text-sm">
                <dt className="text-slate-400">Amount</dt>
                <dd className="font-semibold text-slate-900">{formatPrice(order.amount)}</dd>
                <dt className="text-slate-400">Customer</dt>
                <dd className="text-slate-700">{order.customerId.slice(0, 8)}</dd>
                <dt className="text-slate-400">Created</dt>
                <dd className="text-slate-700">
                  {order.createdAt === null ? '\u2014' : formatDateTime(order.createdAt)}
                </dd>
              </dl>

              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleAccept(order.orderId)}
                  disabled={actionInProgress}
                >
                  {actionOrderId === order.orderId ? 'Accepting\u2026' : 'Accept'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-700 border border-red-200 bg-red-50 hover:bg-red-100"
                  onClick={() => openRejectModal(order.orderId)}
                  disabled={actionInProgress}
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={rejectingOrderId !== null}
        onClose={closeRejectModal}
        title="Reject Order"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeRejectModal}>Cancel</Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmReject}
              disabled={rejectReason.trim() === ''}
            >
              Confirm Reject
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate-600">
          Please provide a reason for rejecting order <strong>{rejectingOrderId?.slice(0, 8)}</strong>.
        </p>
        <Input
          label="Reason"
          name="reject-reason"
          placeholder="e.g. Out of stock, kitchen closed..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
