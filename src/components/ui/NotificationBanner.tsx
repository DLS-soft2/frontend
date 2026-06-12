import { useNotificationContext } from '../../context/useNotificationContext';
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
  const { connected, dismiss } = useNotificationContext();
  const visible = notifications.slice(0, 5);

  return (
    <div className="fixed right-4 top-16 z-50 flex w-80 flex-col gap-2">
      <div className="flex items-center gap-1.5 self-end rounded-full bg-white/90 px-2.5 py-1 text-xs shadow-sm backdrop-blur">
        {connected ? (
          <>
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="font-medium text-green-700">Live</span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
            <span className="text-slate-500">Reconnecting&hellip;</span>
          </>
        )}
      </div>
      {visible.map((notification) => (
        <div
          key={notification.id}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-md"
        >
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {EVENT_LABELS[notification.event_type]}
            </p>
            <button
              onClick={() => dismiss(notification.id)}
              aria-label="Dismiss notification"
              className="ml-2 text-slate-400 hover:text-slate-600"
            >
              &times;
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-900">{notification.message}</p>
          <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(notification.timestamp)}</p>
        </div>
      ))}
    </div>
  );
}
