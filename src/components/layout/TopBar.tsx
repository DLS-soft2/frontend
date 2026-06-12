import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNotificationContext } from '../../context/useNotificationContext';
import type { Notification, NotificationEventType } from '../../types/notification';
import { formatRelativeTime } from '../../utils/format';
import { Button } from '../ui/Button';

const EVENT_LABELS: Record<NotificationEventType, string> = {
  OrderCreated: 'Order Created',
  PaymentAuthorized: 'Payment Authorized',
  PaymentFailed: 'Payment Failed',
  RestaurantAccepted: 'Restaurant Accepted',
  CourierAssigned: 'Courier Assigned',
  DeliveryCompleted: 'Delivery Completed',
};

function MenuIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function NotificationItem({ notification, onDismiss }: { notification: Notification; onDismiss: (id: string) => void }) {
  return (
    <div className="border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {EVENT_LABELS[notification.event_type]}
        </p>
        <button
          onClick={() => onDismiss(notification.id)}
          aria-label="Dismiss notification"
          className="ml-2 text-slate-400 hover:text-slate-600"
        >
          &times;
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-900">{notification.message}</p>
      <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(notification.timestamp)}</p>
    </div>
  );
}

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { isAuthenticated, user, login, logout } = useAuth();
  const { notifications, connected, dismiss, clearAll } = useNotificationContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const count = notifications.length;

  const toggleDropdown = useCallback(() => setDropdownOpen((prev) => !prev), []);

  useEffect(() => {
    if (!dropdownOpen) return undefined;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                  aria-label="Notifications"
                >
                  <BellIcon />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                      <div className="flex items-center gap-1.5">
                        {connected ? (
                          <span className="h-2 w-2 rounded-full bg-green-500" title="Live" />
                        ) : (
                          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" title="Reconnecting" />
                        )}
                      </div>
                    </div>

                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications</p>
                    ) : (
                      <>
                        {notifications.map((n) => (
                          <NotificationItem key={n.id} notification={n} onDismiss={dismiss} />
                        ))}
                        <div className="border-t border-slate-200 px-4 py-2">
                          <button
                            onClick={clearAll}
                            className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700"
                          >
                            Clear all
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <span className="max-w-40 truncate text-sm font-medium text-slate-700">
                {user?.firstName || user?.username}
              </span>
              <Button type="button" variant="secondary" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button type="button" size="sm" onClick={login}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
