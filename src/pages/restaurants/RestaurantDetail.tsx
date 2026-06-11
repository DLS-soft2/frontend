import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRestaurant, listMenuItems } from '../../api/restaurants';
import type { MenuItem, Restaurant } from '../../types/restaurant';
import type { OrderDraft } from '../../types/order';
import { formatPrice } from '../../utils/format';

export default function RestaurantDetail() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    Promise.all([getRestaurant(restaurantId), listMenuItems(restaurantId)])
      .then(([restaurantData, menuData]) => {
        setRestaurant(restaurantData);
        setMenuItems(menuData);
      })
      .catch(() => setError('Failed to load restaurant.'));
  }, [restaurantId]);

  if (error) return <p className="mx-auto max-w-2xl px-4 py-8 text-red-700">{error}</p>;
  if (!restaurant) return <p className="mx-auto max-w-2xl px-4 py-8 text-gray-600">Loading restaurant...</p>;

  const changeQuantity = (menuItemId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [menuItemId]: Math.max(0, (prev[menuItemId] ?? 0) + delta),
    }));
  };

  const selectedItems = menuItems
    .filter((item) => (quantities[item.menuItemId] ?? 0) > 0)
    .map((item) => ({
      menu_item_id: item.menuItemId,
      name: item.name,
      quantity: quantities[item.menuItemId] ?? 0,
      unit_price: item.price,
    }));

  const total = selectedItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const proceedToOrder = () => {
    const draft: OrderDraft = {
      restaurantId: restaurant.restaurantId,
      restaurantName: restaurant.name,
      items: selectedItems,
    };
    navigate('/orders/new', { state: draft });
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">{restaurant.name}</h1>
      <p className="mt-2">{restaurant.description}</p>
      <p className="mt-1 text-sm text-gray-600">
        {restaurant.address} &middot; {restaurant.openingHours} &middot;{' '}
        {restaurant.isOpen ? 'Open' : 'Closed'}
      </p>
      <h2 className="mt-6 text-xl font-semibold">Menu</h2>
      {menuItems.length === 0 && <p className="mt-2 text-gray-600">No menu items available.</p>}
      <ul className="mt-4 grid gap-3">
        {menuItems.map((item) => (
          <li
            key={item.menuItemId}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <strong>{item.name}</strong>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{formatPrice(item.price)}</span>
                <button
                  onClick={() => changeQuantity(item.menuItemId, -1)}
                  className="rounded border border-gray-300 px-2.5 py-1 text-sm hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm">{quantities[item.menuItemId] ?? 0}</span>
                <button
                  onClick={() => changeQuantity(item.menuItemId, 1)}
                  className="rounded border border-gray-300 px-2.5 py-1 text-sm hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between">
        <strong>Total: {formatPrice(total)}</strong>
        <button
          onClick={proceedToOrder}
          disabled={selectedItems.length === 0}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create order
        </button>
      </div>
    </main>
  );
}
