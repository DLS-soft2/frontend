export type DeliveryStatus =
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export interface Delivery {
  deliveryId: string;
  courierId: string;
  orderId: string;
  customerId: string;
  status: DeliveryStatus;
  pickupAddress: string | null;
  deliveryAddress: string | null;
  assignedAt: string;
  completedAt: string | null;
  notes: string | null;
}

export interface Courier {
  courierId: string;
  name: string;
  phoneNumber: string;
  vehicleType: string;
  email: string;
  rating: number | null;
  active: boolean;
}
