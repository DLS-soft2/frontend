import { apiClient } from '../security/axios';
import type { MenuItem, PendingOrder, Restaurant } from '../types/restaurant';

export async function listRestaurants(): Promise<Restaurant[]> {
  const { data } = await apiClient.get<Restaurant[]>('/api/v2/restaurants');
  return data;
}

export async function getRestaurant(restaurantId: string): Promise<Restaurant> {
  const { data } = await apiClient.get<Restaurant>(`/api/v2/restaurants/${restaurantId}`);
  return data;
}

export async function getMyRestaurant(): Promise<Restaurant> {
  const { data } = await apiClient.get<Restaurant>('/api/v2/restaurants/me');
  return data;
}

export async function getPendingOrders(): Promise<PendingOrder[]> {
  const { data } = await apiClient.get<PendingOrder[]>('/api/v2/restaurants/orders/pending');
  return data;
}

export async function acceptOrder(orderId: string): Promise<PendingOrder> {
  const { data } = await apiClient.post<PendingOrder>(
    `/api/v2/restaurants/orders/${orderId}/accept`,
  );
  return data;
}

export async function rejectOrder(orderId: string, reason: string): Promise<PendingOrder> {
  const { data } = await apiClient.post<PendingOrder>(
    `/api/v2/restaurants/orders/${orderId}/reject`,
    { reason },
  );
  return data;
}

export async function listMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const { data } = await apiClient.get<MenuItem[]>(
    `/api/v2/restaurants/menu-items/restaurant/${restaurantId}`,
  );
  return data;
}
