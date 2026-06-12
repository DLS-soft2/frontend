import type { DeliveryStatus } from '../../types/delivery';
import { toTitleCase } from '../../utils/format';

const STATUS_CLASSES: Record<DeliveryStatus, string> = {
  ASSIGNED: 'bg-blue-100 text-blue-800',
  PICKED_UP: 'bg-indigo-100 text-indigo-800',
  IN_TRANSIT: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-slate-100 text-slate-800',
};

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
}

export default function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}>
      {toTitleCase(status)}
    </span>
  );
}
