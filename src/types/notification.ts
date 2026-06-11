export type NotificationEventType =
  | 'OrderCreated'
  | 'PaymentAuthorized'
  | 'PaymentFailed'
  | 'RestaurantAccepted'
  | 'CourierAssigned'
  | 'DeliveryCompleted';

export interface Notification {
  id: string;
  event_id: string;
  order_id: string;
  customer_id: string;
  event_type: NotificationEventType;
  message: string;
  timestamp: string;
}
