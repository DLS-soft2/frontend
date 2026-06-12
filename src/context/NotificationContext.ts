import { createContext } from 'react';
import type { ClientNotification } from '../lib/useNotifications';

export interface NotificationState {
  notifications: ClientNotification[];
  unreadCount: number;
  connected: boolean;
  dismiss: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const NotificationContext = createContext<NotificationState | null>(null);
