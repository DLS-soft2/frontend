import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRestaurants } from '../../api/restaurants';
import { fetchRestaurantsGraphql } from '../../api/restaurantQueries';
import ApiSourceToggle, { type ApiSource } from '../../components/ui/ApiSourceToggle';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
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
    return <LoadingState title="Loading restaurants" message="Finding the best places near you." />;
  }

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

  return (
    <div>
      <PageHeader title="Restaurants">
        <ApiSourceToggle source={source} onChange={changeSource} />
      </PageHeader>

      {restaurants.length === 0 && (
        <p className="mt-6 text-slate-600">No restaurants available.</p>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {restaurants.map((restaurant) => (
          <Card
            as="article"
            key={restaurant.restaurantId}
            className="flex flex-col hover:border-slate-300 hover:shadow-md transition-all"
          >
            <svg className="mb-3 h-10 w-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
            </svg>

            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">{restaurant.name}</h2>
              <span
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  restaurant.isOpen
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`}
                />
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>

            {restaurant.description && (
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                {restaurant.description}
              </p>
            )}

            <p className="mt-3 text-xs text-slate-400">
              {restaurant.address}
              {restaurant.openingHours && (
                <> &middot; {restaurant.openingHours}</>
              )}
            </p>

            <div className="mt-auto pt-4">
              <Link
                to={`/restaurants/${restaurant.restaurantId}`}
                className="text-sm font-semibold text-blue-700 transition-colors hover:text-blue-900"
              >
                View menu &rarr;
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
