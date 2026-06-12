import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../../api/orders';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useCart } from '../../context/useCart';
import type { OrderDraft } from '../../types/order';
import { formatPrice } from '../../utils/format';

export default function OrderCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft: cartDraft, clearCart } = useCart();
  const locationDraft = location.state as OrderDraft | null;
  const draft = cartDraft ?? locationDraft;
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!draft || draft.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="text-center">
          <h1 className="text-lg font-semibold">Your cart is empty</h1>
          <p className="mt-2 text-sm text-slate-600">
            Pick a restaurant and add some dishes to start an order.
          </p>
          <div className="mt-5">
            <ButtonLink to="/restaurants">Browse restaurants</ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  const total = draft.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (deliveryAddress.trim() === '') {
      setAddressError('Delivery address is required.');
      return;
    }
    setAddressError(null);
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder({
        restaurant_id: draft.restaurantId,
        delivery_address: deliveryAddress,
        items: draft.items,
      });
      clearCart();
      navigate(`/orders/${order.id}`);
    } catch {
      setError('Failed to create order.');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Create Order</h1>
      <p className="mt-2">
        Ordering from <strong>{draft.restaurantName}</strong>
      </p>
      <Card className="mt-4 px-6 py-2">
        <ul className="divide-y divide-slate-200">
          {draft.items.map((item) => (
            <li key={item.menu_item_id} className="flex justify-between py-2 text-sm">
              <span>
                {item.quantity} &times; {item.name}
              </span>
              <span>{formatPrice(item.quantity * item.unit_price)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <p className="mt-2 text-right">
        <strong>Total: {formatPrice(total)}</strong>
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-4 grid gap-3">
        <label htmlFor="delivery-address" className="text-sm font-medium">
          Delivery address
        </label>
        <input
          id="delivery-address"
          value={deliveryAddress}
          onChange={(event) => setDeliveryAddress(event.target.value)}
          required
          aria-invalid={addressError !== null}
          aria-describedby={addressError ? 'delivery-address-error' : undefined}
          placeholder="Street, number, city"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
        {addressError && (
          <p id="delivery-address-error" className="text-sm text-red-700">
            {addressError}
          </p>
        )}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={submitting} className="justify-self-start">
          {submitting ? 'Placing order...' : 'Place order'}
        </Button>
      </form>
    </div>
  );
}
