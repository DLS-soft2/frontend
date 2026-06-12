import type { Notification } from '../../types/notification';
import type { OrderSnapshot, OrderStatus } from '../../types/order';
import { formatDateTime } from '../../utils/format';

type TimelineEntry =
  | { kind: 'snapshot'; data: OrderSnapshot; time: string }
  | { kind: 'notification'; data: Notification; time: string };

interface SagaTimelineProps {
  snapshots: OrderSnapshot[];
  notifications: Notification[];
  currentStatus?: OrderStatus;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-500',
  PAID: 'bg-blue-500',
  PREPARING: 'bg-indigo-500',
  OUT_FOR_DELIVERY: 'bg-orange-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
};

const NOTIFICATION_DOT = 'bg-slate-400';

function toTitleCase(raw: string): string {
  const lower = raw.replace(/_/g, ' ').toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function humanEventType(eventType: string): string {
  return eventType.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function SagaTimeline({ snapshots, notifications, currentStatus }: SagaTimelineProps) {
  const entries: TimelineEntry[] = [
    ...snapshots.map((s): TimelineEntry => ({ kind: 'snapshot', data: s, time: s.created_at })),
    ...notifications.map((n): TimelineEntry => ({ kind: 'notification', data: n, time: n.timestamp })),
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  if (entries.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-500">
        No saga events yet. Updates will appear here as the order progresses.
      </p>
    );
  }

  return (
    <ol className="relative ml-3 border-l-2 border-slate-200">
      {entries.map((entry, index) => {
        const isLatest = index === entries.length - 1;
        const dotSize = isLatest ? 'h-3.5 w-3.5 -left-[7.5px]' : 'h-2.5 w-2.5 -left-[5.5px]';
        const dotColor =
          entry.kind === 'snapshot'
            ? STATUS_COLORS[entry.data.status] ?? 'bg-slate-400'
            : NOTIFICATION_DOT;

        return (
          <li key={entry.kind === 'snapshot' ? `s-${entry.data.id}` : `n-${entry.data.id}`} className="relative pb-6 pl-7 last:pb-0">
            <span
              className={`absolute top-1 rounded-full ring-2 ring-white ${dotSize} ${dotColor} ${isLatest ? 'ring-4' : ''}`}
            />
            <div className={isLatest ? 'font-semibold' : ''}>
              {entry.kind === 'snapshot' ? (
                <>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClasses(entry.data.status)}`}
                  >
                    {toTitleCase(entry.data.status)}
                  </span>
                  {currentStatus === entry.data.status && isLatest && (
                    <span className="ml-2 text-xs text-slate-500">(current)</span>
                  )}
                </>
              ) : (
                <span className="text-sm text-slate-800">
                  {humanEventType(entry.data.event_type)}
                </span>
              )}
            </div>
            {entry.kind === 'notification' && entry.data.message && (
              <p className="mt-0.5 text-sm text-slate-600">{entry.data.message}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">{formatDateTime(entry.time)}</p>
          </li>
        );
      })}
    </ol>
  );
}

function statusBadgeClasses(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    PAID: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-indigo-100 text-indigo-800',
    OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return map[status];
}
