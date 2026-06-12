import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCustomerOrders } from '../../api/orders';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { type Column, DataTable } from '../../components/ui/DataTable';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/useAuth';
import type { Order } from '../../types/order';
import { formatDateTime, formatPrice } from '../../utils/format';

const columns: Column<Order>[] = [
  {
    key: 'id',
    header: 'Order ID',
    render: (order) => (
      <span className="font-mono text-xs text-slate-700">{order.id.slice(0, 8)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (order) => <StatusBadge status={order.status} />,
  },
  {
    key: 'date',
    header: 'Date',
    render: (order) => (
      <span className="text-slate-600">{formatDateTime(order.created_at)}</span>
    ),
  },
  {
    key: 'total',
    header: 'Total',
    render: (order) => (
      <span className="font-medium text-slate-900">{formatPrice(order.total_amount)}</span>
    ),
  },
  {
    key: 'actions',
    header: '',
    render: (order) => (
      <ButtonLink to={`/orders/${order.id}`} variant="ghost" size="sm">
        View &rarr;
      </ButtonLink>
    ),
    className: 'text-right',
  },
];

export default function OrderList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    listCustomerOrders(user.id)
      .then(setOrders)
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [user, reloadKey]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  if (loading) {
    return <LoadingState title="Loading orders" message="Fetching your order history." />;
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

  if (orders.length === 0) {
    return (
      <div>
        <PageHeader title="My Orders" />
        <Card className="mt-6 text-center">
          <p className="text-slate-600">You haven&rsquo;t placed any orders yet.</p>
          <div className="mt-4">
            <ButtonLink to="/restaurants">Browse restaurants</ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Orders" />
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={orders}
          keyExtractor={(order) => order.id}
          onRowClick={(order) => navigate(`/orders/${order.id}`)}
          emptyMessage="No orders yet."
        />
      </div>
    </div>
  );
}
