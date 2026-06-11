import { apiClient } from '../security/axios';
import type { MenuItem, Restaurant } from '../types/restaurant';

export async function listRestaurants(): Promise<Restaurant[]> {
  const { data } = await apiClient.get<Restaurant[]>('/api/v2/restaurants');
  return data;
}

export async function getRestaurant(restaurantId: string): Promise<Restaurant> {
  const { data } = await apiClient.get<Restaurant>(`/api/v2/restaurants/${restaurantId}`);
  return data;
}

export async function listMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const { data } = await apiClient.get<MenuItem[]>(
    `/api/v2/restaurants/menu-items/restaurant/${restaurantId}`,
  );
  return data;
}
