import { useEffect, useState } from 'react';
import { listRestaurants } from '../../api/restaurants';
import { fetchRestaurantsGraphql } from '../../api/restaurantQueries';
import ApiSourceToggle, { type ApiSource } from '../../components/ui/ApiSourceToggle';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import type { Restaurant } from '../../types/restaurant';

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [source, setSource] = useState<ApiSource>('rest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchRestaurants = source === 'rest' ? listRestaurants : fetchRestaurantsGraphql;
    fetchRestaurants()
      .then(setRestaurants)
      .catch(() => setError('Failed to load restaurants.'))
      .finally(() => setLoading(false));
  }, [source, reloadKey]);

  const changeSource = (next: ApiSource) => {
    setSource(next);
    setLoading(true);
    setError(null);
  };

  const retry = () => {
    setError(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <LoadingState title="Loading restaurants" message="Finding the best places near you." />
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <ApiSourceToggle source={source} onChange={changeSource} />
      </div>
      {restaurants.length === 0 && (
        <p className="mt-4 text-slate-600">No restaurants available.</p>
      )}
      <div className="mt-6 grid gap-4">
        {restaurants.map((restaurant) => (
          <Card as="article" key={restaurant.restaurantId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{restaurant.name}</h2>
                <span
                  className={
                    restaurant.isOpen
                      ? 'inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800'
                      : 'inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800'
                  }
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  {restaurant.isOpen ? 'Open now' : 'Closed'}
                </span>
              </div>
            </CardHeader>
            {restaurant.description && (
              <p className="text-sm text-slate-600">{restaurant.description}</p>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span>{restaurant.address}</span>
              <span className="text-slate-300">&bull;</span>
              <span>{restaurant.openingHours}</span>
            </div>
            <div className="mt-4">
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
    </div>
  );
}
