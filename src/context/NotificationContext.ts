import { createContext } from 'react';
import type { Notification } from '../types/notification';

export interface NotificationState {
  notifications: Notification[];
  connected: boolean;
  dismiss: (id: string) => void;
}

export const NotificationContext = createContext<NotificationState | null>(null);
