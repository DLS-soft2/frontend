import { useCallback, useEffect, useRef, useState } from 'react';
import { settings } from '../settings';
import type { Notification } from '../types/notification';

export interface ClientNotification extends Notification {
  read: boolean;
}

const RECONNECT_DELAY_MS = 3000;
const STORAGE_KEY = 'dls_dismissed_notifications';
const STORAGE_READ_KEY = 'dls_read_notifications';

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function saveSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

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
  const dismissedRef = useRef(loadSet(STORAGE_KEY));
  const readRef = useRef(loadSet(STORAGE_READ_KEY));

  const dismiss = useCallback((id: string) => {
    dismissedRef.current.add(id);
    saveSet(STORAGE_KEY, dismissedRef.current);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markRead = useCallback((id: string) => {
    readRef.current.add(id);
    saveSet(STORAGE_READ_KEY, readRef.current);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      for (const n of prev) readRef.current.add(n.id);
      saveSet(STORAGE_READ_KEY, readRef.current);
      return prev.map((n) => (n.read ? n : { ...n, read: true }));
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications((prev) => {
      for (const n of prev) dismissedRef.current.add(n.id);
      saveSet(STORAGE_KEY, dismissedRef.current);
      return [];
    });
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
        setConnected(true);
      };
      socket.onmessage = (event: MessageEvent<string>) => {
        const notification = JSON.parse(event.data) as Notification;
        if (dismissedRef.current.has(notification.id)) return;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notification.id)) return prev;
          const isRead = readRef.current.has(notification.id);
          return [{ ...notification, read: isRead }, ...prev];
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
