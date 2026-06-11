import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../../api/orders';
import { useAuth } from '../../context/useAuth';
import type { OrderDraft } from '../../types/order';
import { formatPrice } from '../../utils/format';

export default function OrderCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const draft = location.state as OrderDraft | null;
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!draft || draft.items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-gray-600">
          No items selected.{' '}
          <Link to="/restaurants" className="text-blue-600 hover:underline">
            Browse restaurants
          </Link>{' '}
          to start an order.
        </p>
      </main>
    );
  }

  const total = draft.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder({
        customer_id: user.id,
        restaurant_id: draft.restaurantId,
        delivery_address: deliveryAddress,
        items: draft.items,
      });
      navigate(`/orders/${order.id}`);
    } catch {
      setError('Failed to create order.');
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Create Order</h1>
      <p className="mt-2">
        Ordering from <strong>{draft.restaurantName}</strong>
      </p>
      <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white px-4 shadow-sm">
        {draft.items.map((item) => (
          <li key={item.menu_item_id} className="flex justify-between py-2 text-sm">
            <span>
              {item.quantity} &times; {item.name}
            </span>
            <span>{formatPrice(item.quantity * item.unit_price)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-right">
        <strong>Total: {formatPrice(total)}</strong>
      </p>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
        <label htmlFor="delivery-address" className="text-sm font-medium">
          Delivery address
        </label>
        <input
          id="delivery-address"
          value={deliveryAddress}
          onChange={(event) => setDeliveryAddress(event.target.value)}
          required
          placeholder="Street, number, city"
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Placing order...' : 'Place order'}
        </button>
      </form>
    </main>
  );
}
