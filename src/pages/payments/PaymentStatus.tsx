import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPaymentsByOrder } from '../../api/payments';
import { Button, ButtonLink } from '../../components/ui/Button';
import { type Column, DataTable } from '../../components/ui/DataTable';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import PaymentBadge from '../../components/ui/PaymentBadge';
import type { Payment } from '../../types/payment';
import { formatDateTime, formatPrice } from '../../utils/format';

const columns: Column<Payment>[] = [
  {
    key: 'id',
    header: 'Payment ID',
    render: (payment) => (
      <span className="font-mono text-xs text-slate-700">{payment.id.slice(0, 8)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (payment) => <PaymentBadge status={payment.status} />,
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (payment) => (
      <span className="font-medium text-slate-900">{formatPrice(payment.amount)}</span>
    ),
  },
  {
    key: 'created',
    header: 'Created',
    render: (payment) => (
      <span className="text-slate-600">{formatDateTime(payment.created_at)}</span>
    ),
  },
  {
    key: 'updated',
    header: 'Updated',
    render: (payment) =>
      payment.updated_at !== payment.created_at ? (
        <span className="text-slate-600">{formatDateTime(payment.updated_at)}</span>
      ) : (
        <span className="text-slate-400">&mdash;</span>
      ),
  },
];

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
    return <LoadingState title="Loading payments" message="Fetching payment records for this order." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        action={
          <Button variant="secondary" onClick={retry}>
            Try again
          </Button>
        }
      />
    );
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Payments" subtitle={`Order ${orderId?.slice(0, 8) ?? ''}`} />

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={payments}
          keyExtractor={(payment) => payment.id}
          emptyMessage="No payments recorded for this order yet."
        />
      </div>

      <div className="mt-6">
        <ButtonLink to={`/orders/${orderId}`} variant="secondary" size="sm">
          Back to order
        </ButtonLink>
      </div>
    </div>
  );
}
