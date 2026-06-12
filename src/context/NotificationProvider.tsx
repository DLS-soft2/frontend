import type { ReactNode } from 'react';
import { useNotifications } from '../lib/useNotifications';
import { NotificationContext } from './NotificationContext';
import { useAuth } from './useAuth';

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const { notifications, connected, dismiss } = useNotifications(user?.id);

  return (
    <NotificationContext.Provider value={{ notifications, connected, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}
