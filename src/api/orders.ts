import { apiClient } from '../security/axios';
import type { Order, OrderCreate, OrderSnapshot } from '../types/order';

export async function createOrder(order: OrderCreate): Promise<Order> {
  const { data } = await apiClient.post<Order>('/api/v1/orders/', order);
  return data;
}

export async function listOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>('/api/v1/orders/');
  return data;
}

export async function listCustomerOrders(customerId: string): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>(`/api/v1/orders/customer/${customerId}`);
  return data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/api/v1/orders/${orderId}`);
  return data;
}

export async function deleteOrder(orderId: string): Promise<void> {
  await apiClient.delete(`/api/v1/orders/${orderId}`);
}

export async function getOrderSnapshots(orderId: string): Promise<OrderSnapshot[]> {
  const { data } = await apiClient.get<OrderSnapshot[]>(`/api/v1/orders/${orderId}/snapshots`);
  return data;
}
