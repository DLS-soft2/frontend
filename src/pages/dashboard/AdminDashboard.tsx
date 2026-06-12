import { useEffect, useState } from 'react';
import { listOrders } from '../../api/orders';
import { listPayments } from '../../api/payments';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import PaymentBadge from '../../components/ui/PaymentBadge';
import StatusBadge from '../../components/ui/StatusBadge';
import type { Order } from '../../types/order';
import type { Payment } from '../../types/payment';
import { formatDateTime, formatPrice } from '../../utils/format';

const ORDER_COLUMNS: Column<Order>[] = [
  {
    key: 'id',
    header: 'Order',
    render: (order) => <span className="font-medium text-slate-900">{order.id.slice(0, 8)}</span>,
  },
  {
    key: 'created_at',
    header: 'Created',
    render: (order) => formatDateTime(order.created_at),
  },
  {
    key: 'total_amount',
    header: 'Amount',
    render: (order) => formatPrice(order.total_amount),
  },
  {
    key: 'status',
    header: 'Status',
    render: (order) => <StatusBadge status={order.status} />,
  },
];

const PAYMENT_COLUMNS: Column<Payment>[] = [
  {
    key: 'id',
    header: 'Payment',
    render: (payment) => <span className="font-medium text-slate-900">{payment.id.slice(0, 8)}</span>,
  },
  {
    key: 'order_id',
    header: 'Order',
    render: (payment) => payment.order_id.slice(0, 8),
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (payment) => formatPrice(payment.amount),
  },
  {
    key: 'status',
    header: 'Status',
    render: (payment) => <PaymentBadge status={payment.status} />,
  },
];

function StatCard({ icon, label, value, borderColor }: { icon: React.ReactNode; label: string; value: number; borderColor: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm border-l-4 ${borderColor}`}>
      <div className="flex items-center gap-3">
        <div className="text-slate-400">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listOrders(), listPayments()])
      .then(([orderData, paymentData]) => {
        setOrders(orderData);
        setPayments(paymentData);
      })
      .catch(() => setError('Failed to load admin overview.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState title="Loading overview" message="Fetching admin data." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Admin Overview" />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          borderColor="border-l-blue-500"
          label="Total Orders"
          value={orders.length}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          }
        />
        <StatCard
          borderColor="border-l-emerald-500"
          label="Total Payments"
          value={payments.length}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          }
        />
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Orders</h2>
      <DataTable
        columns={ORDER_COLUMNS}
        data={orders}
        keyExtractor={(order) => order.id}
        emptyMessage="No orders."
      />

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Payments</h2>
      <DataTable
        columns={PAYMENT_COLUMNS}
        data={payments}
        keyExtractor={(payment) => payment.id}
        emptyMessage="No payments."
      />
    </div>
  );
}
