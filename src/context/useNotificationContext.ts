import { useContext } from 'react';
import { NotificationContext, type NotificationState } from './NotificationContext';

export function useNotificationContext(): NotificationState {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
