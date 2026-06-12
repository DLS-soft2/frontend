import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../../api/orders';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
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
      <div className="mx-auto max-w-xl">
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
    <div className="mx-auto max-w-xl">
      <PageHeader title="Create Order" subtitle={`Ordering from ${draft.restaurantName}`} />

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Order Summary
          </h2>
        </CardHeader>
        <ul className="divide-y divide-slate-100">
          {draft.items.map((item) => (
            <li key={item.menu_item_id} className="flex justify-between py-2 text-sm">
              <span>
                {item.quantity} &times; {item.name}
              </span>
              <span className="font-medium">{formatPrice(item.quantity * item.unit_price)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-slate-100 pt-3 text-right text-lg font-bold">
          Total: {formatPrice(total)}
        </p>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Delivery Details
          </h2>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <Input
            label="Delivery address"
            name="delivery-address"
            value={deliveryAddress}
            onChange={(event) => setDeliveryAddress(event.target.value)}
            required
            placeholder="Street, number, city"
            error={addressError ?? undefined}
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={submitting} className="justify-self-start">
            {submitting ? 'Placing order...' : 'Place order'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
