export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'FAILED' | 'CAPTURED' | 'REFUNDED';

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}
