import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRestaurants } from '../../api/restaurants';
import { fetchRestaurantsGraphql } from '../../api/restaurantQueries';
import ApiSourceToggle, { type ApiSource } from '../../components/ui/ApiSourceToggle';
import type { Restaurant } from '../../types/restaurant';

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [source, setSource] = useState<ApiSource>('rest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = source === 'rest' ? listRestaurants : fetchRestaurantsGraphql;
    fetchRestaurants()
      .then(setRestaurants)
      .catch(() => setError('Failed to load restaurants.'))
      .finally(() => setLoading(false));
  }, [source]);

  const changeSource = (next: ApiSource) => {
    setSource(next);
    setLoading(true);
    setError(null);
  };

  if (loading) return <p className="mx-auto max-w-2xl px-4 py-8 text-gray-600">Loading restaurants...</p>;
  if (error) return <p className="mx-auto max-w-2xl px-4 py-8 text-red-700">{error}</p>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <ApiSourceToggle source={source} onChange={changeSource} />
      </div>
      {restaurants.length === 0 && <p className="mt-4 text-gray-600">No restaurants available.</p>}
      <ul className="mt-6 grid gap-3">
        {restaurants.map((restaurant) => (
          <li
            key={restaurant.restaurantId}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <Link
                to={`/restaurants/${restaurant.restaurantId}`}
                className="text-lg font-bold text-blue-600 hover:underline"
              >
                {restaurant.name}
              </Link>
              <span className={restaurant.isOpen ? 'text-sm font-medium text-green-700' : 'text-sm font-medium text-red-700'}>
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="mt-2 text-sm">{restaurant.description}</p>
            <p className="mt-1 text-sm text-gray-600">
              {restaurant.address} &middot; {restaurant.openingHours}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
