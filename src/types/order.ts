export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemCreate {
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderCreate {
  restaurant_id: string;
  delivery_address: string;
  items: OrderItemCreate[];
}

export interface OrderItem {
  id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderSnapshot {
  id: string;
  order_id: string;
  status: OrderStatus;
  snapshot_data: Record<string, unknown>;
  created_at: string;
}

export interface OrderDraft {
  restaurantId: string;
  restaurantName: string;
  items: OrderItemCreate[];
}
