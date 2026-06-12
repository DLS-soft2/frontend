import { apiClient } from '../security/axios';

export interface DeliveryReceipt {
  order_id: string;
  customer_id: string;
  delivered_at: string;
  generated_at: string;
  status: string;
}

export async function getDeliveryReceipt(orderId: string): Promise<DeliveryReceipt | null> {
  try {
    const { data } = await apiClient.get<DeliveryReceipt>(`/api/v1/receipts/${orderId}`);
    return data;
  } catch {
    return null;
  }
}
