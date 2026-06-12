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
import { useCart } from '../../context/useCart';
import type { MenuItemSummary, Restaurant } from '../../types/restaurant';
import { formatPrice } from '../../utils/format';

function ClockIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PizzaIcon() {
  return (
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
      <path d="M15 11h.01M11 15h.01M16 16h.01" />
      <path d="M2 16l20-12L18 20 2 16z" />
    </svg>
  );
}

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
        action={<Button variant="secondary" onClick={retry}>Try again</Button>}
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
  const itemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

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
      {/* Hero / header */}
      <div className="mb-6">
        <ButtonLink to="/restaurants" variant="ghost" size="sm">
          &larr; Back
        </ButtonLink>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-8 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{restaurant.name}</h1>
            {restaurant.description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 line-clamp-2">
                {restaurant.description}
              </p>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${restaurant.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {restaurant.isOpen ? 'Open now' : 'Closed'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5"><MapPinIcon /> {restaurant.address}</span>
          <span className="flex items-center gap-1.5"><ClockIcon /> {restaurant.openingHours}</span>
        </div>
      </div>

      {/* Menu + Cart */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: menu */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
            <ApiSourceToggle source={menuSource} onChange={setMenuSource} />
          </div>

          {menuItems.length === 0 && (
            <p className="mt-6 text-sm text-slate-500">No menu items available.</p>
          )}

          <div className="mt-4 space-y-3">
            {menuItems.map((item) => {
              const qty = quantities[item.menuItemId] ?? 0;
              const isSelected = qty > 0;
              return (
                <div
                  key={item.menuItemId}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${isSelected ? 'border-blue-300 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  {/* Food icon placeholder */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    <PizzaIcon />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">{item.name}</h3>
                      <span className="shrink-0 text-sm font-bold text-slate-900">{formatPrice(item.price)}</span>
                    </div>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{item.description}</p>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex shrink-0 items-center gap-1">
                    {isSelected && (
                      <>
                        <button
                          onClick={() => changeQuantity(item.menuItemId, -1)}
                          aria-label={`Remove one ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          &minus;
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{qty}</span>
                      </>
                    )}
                    <button
                      onClick={() => changeQuantity(item.menuItemId, 1)}
                      aria-label={`Add one ${item.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: cart */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card className="border-slate-200">
            <div className="flex items-center gap-2">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              <h2 className="text-base font-semibold text-slate-900">Your order</h2>
              {itemCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{itemCount}</span>
              )}
            </div>

            {selectedItems.length === 0 ? (
              <div className="mt-6 flex flex-col items-center py-4 text-center">
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-slate-300">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                <p className="mt-2 text-sm text-slate-400">Your cart is empty</p>
                <p className="mt-1 text-xs text-slate-400">Tap + to add items</p>
              </div>
            ) : (
              <>
                <ul className="mt-4 divide-y divide-slate-100">
                  {selectedItems.map((item) => (
                    <li key={item.menu_item_id} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <span className="text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {formatPrice(item.quantity * item.unit_price)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Total</span>
                    <span className="text-lg font-bold text-slate-900">{formatPrice(total)}</span>
                  </div>
                  <Button onClick={proceedToOrder} className="mt-4 w-full">
                    Go to checkout
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
