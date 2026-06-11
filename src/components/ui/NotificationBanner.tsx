import { useState } from 'react';
import type { Notification, NotificationEventType } from '../../types/notification';
import { formatRelativeTime } from '../../utils/format';

const EVENT_LABELS: Record<NotificationEventType, string> = {
  OrderCreated: 'Order Created',
  PaymentAuthorized: 'Payment Authorized',
  PaymentFailed: 'Payment Failed',
  RestaurantAccepted: 'Restaurant Accepted',
  CourierAssigned: 'Courier Assigned',
  DeliveryCompleted: 'Delivery Completed',
};

interface NotificationBannerProps {
  notifications: Notification[];
}

export default function NotificationBanner({ notifications }: NotificationBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const visible = notifications.filter((n) => !dismissedIds.has(n.id)).slice(0, 5);

  if (visible.length === 0) return null;

  const dismiss = (id: string) =>
    setDismissedIds((prev) => new Set(prev).add(id));

  return (
    <div className="fixed right-4 top-16 z-50 flex w-80 flex-col gap-2">
      {visible.map((notification) => (
        <div
          key={notification.id}
          className="rounded-lg border border-gray-200 bg-white p-3 shadow-md"
        >
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {EVENT_LABELS[notification.event_type]}
            </p>
            <button
              onClick={() => dismiss(notification.id)}
              aria-label="Dismiss notification"
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-900">{notification.message}</p>
          <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(notification.timestamp)}</p>
        </div>
      ))}
    </div>
  );
}
