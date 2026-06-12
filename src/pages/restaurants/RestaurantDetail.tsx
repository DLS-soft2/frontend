import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRestaurant, listMenuItems } from '../../api/restaurants';
import { fetchMenuItemsGraphql } from '../../api/restaurantQueries';
import ApiSourceToggle, { type ApiSource } from '../../components/ui/ApiSourceToggle';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { useCart } from '../../context/useCart';
import type { MenuItemSummary, Restaurant } from '../../types/restaurant';
import { formatPrice } from '../../utils/format';

export default function RestaurantDetail() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { setDraft } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemSummary[]>([]);
  const [menuSource, setMenuSource] = useState<ApiSource>('rest');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!restaurantId) return;
    getRestaurant(restaurantId)
      .then(setRestaurant)
      .catch(() => setError('Failed to load restaurant.'));
  }, [restaurantId, reloadKey]);

  useEffect(() => {
    if (!restaurantId) return;
    const fetchMenu = menuSource === 'rest' ? listMenuItems : fetchMenuItemsGraphql;
    fetchMenu(restaurantId)
      .then(setMenuItems)
      .catch(() => setError('Failed to load menu.'));
  }, [restaurantId, menuSource, reloadKey]);

  const retry = () => {
    setError(null);
    setRestaurant(null);
    setReloadKey((key) => key + 1);
  };

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

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-2xl">
        <LoadingState title="Loading restaurant" message="Fetching the menu and opening hours." />
      </div>
    );
  }

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
    setDraft({
      restaurantId: restaurant.restaurantId,
      restaurantName: restaurant.name,
      items: selectedItems,
    });
    navigate('/orders/new');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">{restaurant.name}</h1>
      <p className="mt-2">{restaurant.description}</p>
      <p className="mt-1 text-sm text-slate-500">
        {restaurant.address} &middot; {restaurant.openingHours} &middot;{' '}
        {restaurant.isOpen ? (
          <span className="font-medium text-green-700">Open</span>
        ) : (
          <span className="font-medium text-red-700">Closed</span>
        )}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Menu</h2>
        <ApiSourceToggle source={menuSource} onChange={setMenuSource} />
      </div>
      {menuItems.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No menu items available.</p>
      )}
      <div className="mt-4 grid gap-3">
        {menuItems.map((item) => {
          const qty = quantities[item.menuItemId] ?? 0;
          return (
            <Card
              as="article"
              key={item.menuItemId}
              className={`p-4 transition ${qty > 0 ? 'border-blue-300 bg-blue-50/40' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <strong>{item.name}</strong>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatPrice(item.price)}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`Remove one ${item.name}`}
                    onClick={() => changeQuantity(item.menuItemId, -1)}
                  >
                    -
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{qty}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`Add one ${item.name}`}
                    onClick={() => changeQuantity(item.menuItemId, 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedItems.length > 0 && (
        <div className="sticky bottom-4 z-10 mt-6">
          <Card className="border-blue-200 bg-blue-50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Your order &middot; {selectedItems.length}{' '}
                  {selectedItems.length === 1 ? 'item' : 'items'}
                </p>
                <p className="mt-0.5 text-lg font-bold text-blue-950">
                  Total: {formatPrice(total)}
                </p>
              </div>
              <Button onClick={proceedToOrder}>Create order</Button>
            </div>
          </Card>
        </div>
      )}

      {selectedItems.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-400">
          Add items from the menu to start an order.
        </p>
      )}
    </div>
  );
}
