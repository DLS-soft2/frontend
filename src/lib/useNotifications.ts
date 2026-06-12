import { useCallback, useEffect, useState } from 'react';
import { settings } from '../settings';
import type { Notification } from '../types/notification';

const RECONNECT_DELAY_MS = 3000;

function wsBaseUrl(): string {
  if (settings.notificationWsUrl) return settings.notificationWsUrl;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}`;
}

export function useNotifications(customerId: string | undefined): {
  notifications: Notification[];
  connected: boolean;
  dismiss: (id: string) => void;
  clearAll: () => void;
} {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

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
          return [notification, ...prev];
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

  return { notifications, connected, dismiss, clearAll };
}
