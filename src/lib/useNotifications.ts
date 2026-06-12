import { useCallback, useEffect, useState } from 'react';
import { settings } from '../settings';
import type { Notification } from '../types/notification';

export interface ClientNotification extends Notification {
  read: boolean;
}

const RECONNECT_DELAY_MS = 3000;

function wsBaseUrl(): string {
  if (settings.notificationWsUrl) return settings.notificationWsUrl;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}`;
}

export function useNotifications(customerId: string | undefined): {
  notifications: ClientNotification[];
  unreadCount: number;
  connected: boolean;
  dismiss: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
} {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [connected, setConnected] = useState(false);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!customerId) return undefined;

    let socket: WebSocket;
    let reconnectTimer: number | undefined;
    let unmounted = false;

    const connect = () => {
      socket = new WebSocket(`${wsBaseUrl()}/api/v1/ws/${customerId}`);
      socket.onopen = () => {
        setNotifications([]);
        setConnected(true);
      };
      socket.onmessage = (event: MessageEvent<string>) => {
        const notification = JSON.parse(event.data) as Notification;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notification.id)) return prev;
          return [{ ...notification, read: false }, ...prev];
        });
      };
      socket.onclose = () => {
        setConnected(false);
        if (!unmounted) reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY_MS);
      };
    };

    connect();
    return () => {
      unmounted = true;
      window.clearTimeout(reconnectTimer);
      socket.close();
    };
  }, [customerId]);

  return { notifications, unreadCount, connected, dismiss, markRead, markAllRead, clearAll };
}
