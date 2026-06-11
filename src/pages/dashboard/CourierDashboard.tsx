import { useCallback, useEffect, useState } from 'react';
import { completeDelivery, listDeliveries } from '../../api/couriers';
import type { Delivery } from '../../types/delivery';
import DeliveryStatusBadge from '../../components/ui/DeliveryStatusBadge';
import { formatDateTime } from '../../utils/format';

const ACTIONABLE_STATUSES = ['ASSIGNED', 'IN_TRANSIT'];

export default function CourierDashboard() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);

  const loadDeliveries = useCallback(() => {
    listDeliveries()
      .then(setDeliveries)
      .catch(() => setError('Failed to load deliveries.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleComplete = async (orderId: string) => {
    setCompletingOrderId(orderId);
    setError(null);
    try {
      await completeDelivery(orderId);
      loadDeliveries();
    } catch {
      setError('Failed to mark delivery as delivered.');
    } finally {
      setCompletingOrderId(null);
    }
  };

  if (loading) {
    return <p className="mx-auto max-w-4xl px-4 py-8 text-gray-600">Loading deliveries...</p>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Deliveries</h1>
      {error && <p className="mt-2 text-red-700">{error}</p>}
      {deliveries.length === 0 && <p className="mt-4 text-gray-600">No deliveries assigned.</p>}
      <ul className="mt-6 grid gap-3">
        {deliveries.map((delivery) => (
          <li
            key={delivery.deliveryId}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Order {delivery.orderId.slice(0, 8)}</span>
              <DeliveryStatusBadge status={delivery.status} />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Customer {delivery.customerId.slice(0, 8)} &middot; Assigned{' '}
              {formatDateTime(delivery.assignedAt)}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Pickup: {delivery.pickupAddress ?? '\u2014'} &middot; Drop-off:{' '}
              {delivery.deliveryAddress ?? '\u2014'}
            </p>
            {ACTIONABLE_STATUSES.includes(delivery.status) && (
              <button
                onClick={() => handleComplete(delivery.orderId)}
                disabled={completingOrderId === delivery.orderId}
                className="mt-3 rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {completingOrderId === delivery.orderId ? 'Marking...' : 'Mark Delivered'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
