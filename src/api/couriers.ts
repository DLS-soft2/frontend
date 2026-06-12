import { apiClient } from '../security/axios';
import type { Courier, Delivery } from '../types/delivery';

export async function getMyCourier(): Promise<Courier> {
  const { data } = await apiClient.get<Courier>('/api/v2/couriers/me');
  return data;
}

export async function getCurrentCourier(): Promise<Courier> {
  return getMyCourier();
}

export async function listMyDeliveries(courierId: string): Promise<Delivery[]> {
  const { data } = await apiClient.get<Delivery[]>(`/api/v2/deliveries/courier/${courierId}`);
  return data;
}

export async function listDeliveriesForCourier(courierId: string): Promise<Delivery[]> {
  return listMyDeliveries(courierId);
}

export async function completeDelivery(orderId: string): Promise<void> {
  await apiClient.put(`/api/v2/deliveries/${orderId}/complete`);
}

export async function listDeliveries(): Promise<Delivery[]> {
  const { data } = await apiClient.get<Delivery[]>('/api/v2/deliveries');
  return data;
}

export async function getDelivery(deliveryId: string): Promise<Delivery> {
  const { data } = await apiClient.get<Delivery>(`/api/v2/deliveries/${deliveryId}`);
  return data;
}

export async function listCouriers(): Promise<Courier[]> {
  const { data } = await apiClient.get<Courier[]>('/api/v2/couriers');
  return data;
}
