import { useEffect, useState } from 'react';
import { listRestaurants } from '../../api/restaurants';
import { fetchRestaurantsGraphql } from '../../api/restaurantQueries';
import ApiSourceToggle, { type ApiSource } from '../../components/ui/ApiSourceToggle';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
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
      <div className="mx-auto max-w-2xl">
        <LoadingState title="Loading restaurants" message="Finding the best places near you." />
      </div>
    );
  }

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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <ApiSourceToggle source={source} onChange={changeSource} />
      </div>
      {restaurants.length === 0 && <p className="mt-4 text-gray-600">No restaurants available.</p>}
      <div className="mt-6 grid gap-3">
        {restaurants.map((restaurant) => (
          <Card as="article" key={restaurant.restaurantId}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{restaurant.name}</h2>
              <span
                className={
                  restaurant.isOpen
                    ? 'text-sm font-medium text-green-700'
                    : 'text-sm font-medium text-red-700'
                }
              >
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="mt-2 text-sm">{restaurant.description}</p>
            <p className="mt-1 text-sm text-gray-600">
              {restaurant.address} &middot; {restaurant.openingHours}
            </p>
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
