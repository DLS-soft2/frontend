import { useEffect, useMemo, useState } from 'react';
import {
  completeDelivery,
  getMyCourier,
  listMyDeliveries,
} from '../../api/couriers';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import DeliveryStatusBadge from '../../components/ui/DeliveryStatusBadge';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import type { Courier, Delivery } from '../../types/delivery';
import { formatDateTime } from '../../utils/format';

const ACTIONABLE_STATUSES = ['ASSIGNED', 'IN_TRANSIT', 'PICKED_UP'];

type DashboardState =
  | { kind: 'loading' }
  | { kind: 'no-courier' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; courier: Courier; deliveries: Delivery[] };

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

export default function CourierDashboard() {
  const [state, setState] = useState<DashboardState>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const courier = await getMyCourier();
        const deliveries = await listMyDeliveries(courier.courierId);
        if (!cancelled) setState({ kind: 'ready', courier, deliveries });
      } catch (err: unknown) {
        if (cancelled) return;
        if (extractHttpStatus(err) === 404) {
          setState({ kind: 'no-courier' });
        } else {
          setState({ kind: 'error', message: 'Failed to load courier data.' });
        }
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const reload = () => {
    setState({ kind: 'loading' });
    setReloadKey((k) => k + 1);
  };

  const handleComplete = async (orderId: string) => {
    setCompletingOrderId(orderId);
    setActionError(null);
    try {
      await completeDelivery(orderId);
      reload();
    } catch {
      setActionError('Failed to mark delivery as delivered.');
    } finally {
      setCompletingOrderId(null);
    }
  };

  if (state.kind === 'loading') {
    return <LoadingState title="Loading deliveries" message="Resolving your courier profile and assigned deliveries." />;
  }

  if (state.kind === 'error') {
    return (
      <ErrorState
        message={state.message}
        action={
          <Button variant="secondary" onClick={reload}>
            Try again
          </Button>
        }
      />
    );
  }

  if (state.kind === 'no-courier') {
    return (
      <div>
        <PageHeader title="Courier Dashboard" />
        <div className="mt-6">
          <ErrorState
            title="Courier profile not linked"
            message="Your Keycloak account is not yet linked to a courier record in the courier service. A courier must be created with your Keycloak user ID before scoped deliveries can be displayed here."
            action={
              <p className="text-xs text-orange-700">
                Backend dependency: <code className="rounded bg-orange-100 px-1">GET /api/v2/couriers/me</code> returned 404.
              </p>
            }
          />
        </div>
      </div>
    );
  }

  return <ReadyDashboard courier={state.courier} deliveries={state.deliveries} actionError={actionError} completingOrderId={completingOrderId} onReload={reload} onComplete={handleComplete} />;
}

function ReadyDashboard({ courier, deliveries, actionError, completingOrderId, onReload, onComplete }: {
  courier: Courier;
  deliveries: Delivery[];
  actionError: string | null;
  completingOrderId: string | null;
  onReload: () => void;
  onComplete: (orderId: string) => void;
}) {
  const stats = useMemo(() => {
    const active = deliveries.filter((d) => ACTIONABLE_STATUSES.includes(d.status)).length;
    const completed = deliveries.filter((d) => d.status === 'DELIVERED').length;
    return { total: deliveries.length, active, completed };
  }, [deliveries]);

  return (
    <div>
      <PageHeader title={`Deliveries \u2014 ${courier.name}`}>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{courier.vehicleType}</span>
          <Button variant="secondary" size="sm" onClick={onReload}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </Button>
        </div>
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-sm text-slate-500">Total Deliveries</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-sm text-slate-500">Active</p>
          <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
        </div>
      </div>

      {actionError && (
        <p className="mt-4 text-sm font-medium text-red-700" role="alert">{actionError}</p>
      )}

      {deliveries.length === 0 ? (
        <Card className="mt-6 text-center">
          <p className="text-slate-600">No deliveries assigned to you right now.</p>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {deliveries.map((delivery) => (
            <Card as="article" key={delivery.deliveryId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">
                    Order {delivery.orderId.slice(0, 8)}
                  </h2>
                  <DeliveryStatusBadge status={delivery.status} />
                </div>
              </CardHeader>

              <dl className="grid gap-2 text-sm">
                <div className="flex items-baseline gap-2">
                  <dt className="font-medium text-slate-500">Pickup</dt>
                  <dd className="text-slate-800">{delivery.pickupAddress ?? '\u2014'}</dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="font-medium text-slate-500">Drop-off</dt>
                  <dd className="text-slate-800">{delivery.deliveryAddress ?? '\u2014'}</dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="font-medium text-slate-500">Assigned</dt>
                  <dd className="text-slate-800">{formatDateTime(delivery.assignedAt)}</dd>
                </div>
              </dl>

              {ACTIONABLE_STATUSES.includes(delivery.status) && (
                <Button
                  className="mt-4 w-full"
                  onClick={() => onComplete(delivery.orderId)}
                  disabled={completingOrderId === delivery.orderId}
                >
                  {completingOrderId === delivery.orderId ? 'Marking\u2026' : 'Mark delivered'}
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
