import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ButtonLink } from '../../components/ui/Button';
import { getRestaurant, listMenuItems } from '../../api/restaurants';
import { fetchMenuItemsGraphql } from '../../api/restaurantQueries';
import ApiSourceToggle, { type ApiSource } from '../../components/ui/ApiSourceToggle';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
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

  if (!restaurant) {
    return <LoadingState title="Loading restaurant" message="Fetching the menu and opening hours." />;
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
    <div>
      <div className="mb-4">
        <ButtonLink to="/restaurants" variant="ghost" size="sm">
          &larr; Back to restaurants
        </ButtonLink>
      </div>
      <PageHeader title={restaurant.name}>
        <ApiSourceToggle source={menuSource} onChange={setMenuSource} />
      </PageHeader>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span>{restaurant.address}</span>
        <span className="text-slate-300">&middot;</span>
        <span>{restaurant.openingHours}</span>
        <span className="text-slate-300">&middot;</span>
        {restaurant.isOpen ? (
          <span className="font-medium text-green-700">Open</span>
        ) : (
          <span className="font-medium text-red-700">Closed</span>
        )}
      </div>

      {restaurant.description && (
        <p className="mt-3 text-slate-600">{restaurant.description}</p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left column: Menu items */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Menu</h2>
          {menuItems.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">No menu items available.</p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {menuItems.map((item) => {
              const qty = quantities[item.menuItemId] ?? 0;
              return (
                <Card
                  as="article"
                  key={item.menuItemId}
                  className={`flex flex-col transition-all ${qty > 0 ? 'border-blue-300 bg-blue-50/40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900">{item.name}</h3>
                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-4">
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
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right column: Cart summary */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card className="border-blue-200 bg-blue-50/50">
            <h2 className="text-lg font-semibold text-blue-900">Your Order</h2>

            {selectedItems.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                Add items from the menu to start an order.
              </p>
            ) : (
              <>
                <ul className="mt-4 divide-y divide-blue-100">
                  {selectedItems.map((item) => (
                    <li key={item.menu_item_id} className="flex justify-between py-2 text-sm">
                      <span>
                        {item.quantity} &times; {item.name}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.quantity * item.unit_price)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-blue-200 pt-3 text-right text-lg font-bold text-blue-950">
                  Total: {formatPrice(total)}
                </p>
                <div className="mt-4">
                  <Button onClick={proceedToOrder} className="w-full">
                    Create order
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
