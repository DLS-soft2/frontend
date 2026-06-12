import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPaymentsByOrder } from '../../api/payments';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import type { Payment, PaymentStatus as PaymentStatusType } from '../../types/payment';
import { formatDateTime, formatPrice } from '../../utils/format';

const PAYMENT_STATUS_CLASSES: Record<PaymentStatusType, string> = {
  AUTHORIZED: 'bg-green-100 text-green-800',
  PENDING: 'bg-amber-100 text-amber-800',
  FAILED: 'bg-red-100 text-red-800',
  CAPTURED: 'bg-blue-100 text-blue-800',
  REFUNDED: 'bg-slate-100 text-slate-800',
};

function toTitleCase(raw: string): string {
  return raw.charAt(0) + raw.slice(1).toLowerCase();
}

export default function PaymentStatus() {
  const { orderId } = useParams<{ orderId: string }>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    getPaymentsByOrder(orderId)
      .then(setPayments)
      .catch(() => setError('Failed to load payments.'))
      .finally(() => setLoading(false));
  }, [orderId, reloadKey]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <LoadingState title="Loading payments" message="Fetching payment records for this order." />
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
    <div className="mx-auto grid max-w-2xl gap-4">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Order {orderId?.slice(0, 8)}
        </p>
      </div>

      {payments.length === 0 ? (
        <Card className="text-center">
          <p className="text-slate-600">No payments recorded for this order yet.</p>
        </Card>
      ) : (
        payments.map((payment) => (
          <Card as="article" key={payment.id}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Payment {payment.id.slice(0, 8)}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_STATUS_CLASSES[payment.status]}`}
              >
                {toTitleCase(payment.status)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Amount:{' '}
              <span className="font-medium text-slate-800">{formatPrice(payment.amount)}</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Created {formatDateTime(payment.created_at)}
              {payment.updated_at !== payment.created_at && (
                <> &middot; Updated {formatDateTime(payment.updated_at)}</>
              )}
            </p>
          </Card>
        ))
      )}

      <div>
        <ButtonLink to={`/orders/${orderId}`} variant="secondary" size="sm">
          Back to order
        </ButtonLink>
      </div>
    </div>
  );
}
