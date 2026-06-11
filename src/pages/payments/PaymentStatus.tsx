import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPaymentsByOrder } from '../../api/payments';
import type { Payment } from '../../types/payment';
import { formatDateTime, formatPrice } from '../../utils/format';

export default function PaymentStatus() {
  const { orderId } = useParams<{ orderId: string }>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    getPaymentsByOrder(orderId)
      .then(setPayments)
      .catch(() => setError('Failed to load payments.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <p className="mx-auto max-w-2xl px-4 py-8 text-gray-600">Loading payments...</p>;
  }
  if (error) return <p className="mx-auto max-w-2xl px-4 py-8 text-red-700">{error}</p>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Payments for Order {orderId?.slice(0, 8)}</h1>
      <p className="mt-1 text-sm">
        <Link to={`/orders/${orderId}`} className="text-blue-600 hover:underline">
          Back to order
        </Link>
      </p>
      {payments.length === 0 && <p className="mt-4 text-gray-600">No payments for this order.</p>}
      <ul className="mt-6 grid gap-3">
        {payments.map((payment) => (
          <li
            key={payment.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Payment {payment.id.slice(0, 8)}</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                {payment.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Amount: {formatPrice(payment.amount)} &middot; Created{' '}
              {formatDateTime(payment.created_at)}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
