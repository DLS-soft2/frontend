import { useEffect, useState } from 'react';
import { listRestaurants } from '../../api/restaurants';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import type { Restaurant } from '../../types/restaurant';

export default function RestaurantDashboard() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    listRestaurants()
      .then(setRestaurants)
      .catch(() => setError('Failed to load restaurants.'))
      .finally(() => setLoading(false));
  }, [reloadKey]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <LoadingState title="Loading restaurant data" message="Fetching restaurant information." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
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

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage your restaurant, menu, and incoming orders.
      </p>

      <Card className="mt-6 border-amber-200 bg-amber-50">
        <CardHeader>
          <h2 className="text-lg font-semibold text-amber-800">Owner-scoped data not available</h2>
        </CardHeader>
        <p className="text-sm text-slate-700">
          The restaurant service does not yet link Keycloak user accounts to restaurant ownership.
          Once a <code className="rounded bg-amber-100 px-1">/me</code> endpoint is added to the
          restaurant service, this dashboard will show only your restaurant and its orders.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Backend dependency: restaurant-service keycloakId linkage required.
        </p>
      </Card>

      <h2 className="mt-8 text-lg font-semibold">All Restaurants (API evidence)</h2>
      <p className="mt-1 text-sm text-slate-500">
        Showing data from <code className="rounded bg-slate-100 px-1 text-xs">GET /api/v2/restaurants</code> via REST.
      </p>

      {restaurants.length === 0 ? (
        <Card className="mt-4 text-center">
          <p className="text-slate-600">No restaurants found.</p>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4">
          {restaurants.map((restaurant) => (
            <Card as="article" key={restaurant.restaurantId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{restaurant.name}</h3>
                  <span
                    className={
                      restaurant.isOpen
                        ? 'rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800'
                        : 'rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800'
                    }
                  >
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </CardHeader>
              {restaurant.description && (
                <p className="text-sm text-slate-600">{restaurant.description}</p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                {restaurant.address} &middot; {restaurant.openingHours}
              </p>
              <div className="mt-3">
                <ButtonLink
                  to={`/restaurants/${restaurant.restaurantId}`}
                  variant="secondary"
                  size="sm"
                >
                  View menu
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
