import { useCallback, useEffect, useRef, useState } from 'react';
import { settings } from '../settings';
import type { Notification } from '../types/notification';

const RECONNECT_DELAY_MS = 3000;
const AUTO_DISMISS_MS = 8000;

function wsBaseUrl(): string {
  if (settings.notificationWsUrl) return settings.notificationWsUrl;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}`;
}

export function useNotifications(customerId: string | undefined): {
  notifications: Notification[];
  connected: boolean;
  dismiss: (id: string) => void;
} {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    timersRef.current.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const scheduleExpiry = useCallback(
    (id: string) => {
      const timer = window.setTimeout(() => {
        timersRef.current.delete(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [],
  );

  useEffect(() => {
    if (!customerId) return undefined;

    let socket: WebSocket;
    let reconnectTimer: number | undefined;
    let unmounted = false;

    const connect = () => {
      socket = new WebSocket(`${wsBaseUrl()}/api/v1/ws/${customerId}`);
      socket.onopen = () => setConnected(true);
      socket.onmessage = (event: MessageEvent<string>) => {
        const notification = JSON.parse(event.data) as Notification;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notification.id)) return prev;
          return [notification, ...prev];
        });
        scheduleExpiry(notification.id);
      };
      socket.onclose = () => {
        setConnected(false);
        if (!unmounted) reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY_MS);
      };
    };

    connect();
    const timers = timersRef.current;
    return () => {
      unmounted = true;
      window.clearTimeout(reconnectTimer);
      socket.close();
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, [customerId, scheduleExpiry]);

  return { notifications, connected, dismiss };
}
