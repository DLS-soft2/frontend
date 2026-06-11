import type { ReactNode } from 'react';
import Navbar from './Navbar';
import NotificationBanner from '../ui/NotificationBanner';
import { useAuth } from '../../context/useAuth';
import { useNotificationContext } from '../../context/useNotificationContext';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  const { notifications } = useNotificationContext();

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <Navbar />
      {isAuthenticated && <NotificationBanner notifications={notifications} />}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
