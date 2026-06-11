import { apiClient } from '../security/axios';
import type { Payment } from '../types/payment';

export async function listPayments(): Promise<Payment[]> {
  const { data } = await apiClient.get<Payment[]>('/api/v1/payments/');
  return data;
}

export async function getPaymentsByOrder(orderId: string): Promise<Payment[]> {
  const { data } = await apiClient.get<Payment[]>(`/api/v1/payments/order/${orderId}`);
  return data;
}
