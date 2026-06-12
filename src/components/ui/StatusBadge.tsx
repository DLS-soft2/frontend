import type { OrderStatus } from '../../types/order';
import { toTitleCase } from '../../utils/format';
import { STATUS_CLASSES } from './statusClasses';

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}>
      {toTitleCase(status)}
    </span>
  );
}
