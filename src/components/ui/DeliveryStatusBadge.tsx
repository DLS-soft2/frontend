import type { DeliveryStatus } from '../../types/delivery';

const STATUS_CLASSES: Record<DeliveryStatus, string> = {
  ASSIGNED: 'bg-blue-100 text-blue-800',
  PICKED_UP: 'bg-indigo-100 text-indigo-800',
  IN_TRANSIT: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
}

export default function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
