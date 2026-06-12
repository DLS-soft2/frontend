export interface Restaurant {
  restaurantId: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  description: string;
  openingHours: string;
  isOpen: boolean;
  isAvailable: boolean;
}

export type PendingOrderStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface PendingOrder {
  orderId: string;
  customerId: string;
  restaurantId: string;
  paymentId: string;
  amount: number;
  status: PendingOrderStatus;
  createdAt: string | null;
}

export interface MenuItem {
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  restaurantId: string;
}

export type MenuItemSummary = Omit<MenuItem, 'restaurantId'>;
