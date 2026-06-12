import { useEffect, useState } from 'react';
import {
  completeDelivery,
  getCurrentCourier,
  listDeliveriesForCourier,
} from '../../api/couriers';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import DeliveryStatusBadge from '../../components/ui/DeliveryStatusBadge';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
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
        const courier = await getCurrentCourier();
        const deliveries = await listDeliveriesForCourier(courier.courierId);
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
    return (
      <div className="mx-auto max-w-3xl">
        <LoadingState title="Loading deliveries" message="Resolving your courier profile and assigned deliveries." />
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          message={state.message}
          action={
            <Button variant="secondary" onClick={reload}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (state.kind === 'no-courier') {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">Courier Dashboard</h1>
        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-amber-800">Courier profile not linked</h2>
          </CardHeader>
          <p className="text-sm text-slate-600">
            Your Keycloak account is not yet linked to a courier record in the courier service.
            A courier must be created with your Keycloak user ID before scoped deliveries can
            be displayed here.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Backend dependency: <code className="rounded bg-slate-100 px-1">GET /api/v2/couriers/me</code> returned 404.
          </p>
        </Card>
      </div>
    );
  }

  const { courier, deliveries } = state;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courier Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {courier.name} &middot; {courier.vehicleType}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={reload}>
          Refresh
        </Button>
      </div>

      {actionError && (
        <p className="mt-4 text-sm font-medium text-red-700" role="alert">{actionError}</p>
      )}

      {deliveries.length === 0 ? (
        <Card className="mt-6 text-center">
          <p className="text-slate-600">No deliveries assigned to you right now.</p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4">
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
                <div className="mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleComplete(delivery.orderId)}
                    disabled={completingOrderId === delivery.orderId}
                  >
                    {completingOrderId === delivery.orderId
                      ? 'Marking\u2026'
                      : 'Mark delivered'}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
