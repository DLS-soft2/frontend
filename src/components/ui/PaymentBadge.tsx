import type { PaymentStatus } from '../../types/payment';
import { toTitleCase } from '../../utils/format';

const PAYMENT_STATUS_CLASSES: Record<PaymentStatus, string> = {
  AUTHORIZED: 'bg-green-100 text-green-800',
  PENDING: 'bg-amber-100 text-amber-800',
  FAILED: 'bg-red-100 text-red-800',
  CAPTURED: 'bg-blue-100 text-blue-800',
  REFUNDED: 'bg-slate-100 text-slate-800',
};

interface PaymentBadgeProps {
  status: PaymentStatus;
}

export default function PaymentBadge({ status }: PaymentBadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_STATUS_CLASSES[status]}`}>
      {toTitleCase(status)}
    </span>
  );
}
