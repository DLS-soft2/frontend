import { useState, useCallback, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import NotificationBanner from '../ui/NotificationBanner';
import { useAuth } from '../../context/useAuth';
import { useNotificationContext } from '../../context/useNotificationContext';

const STORAGE_KEY = 'sidebar-collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  const { notifications } = useNotificationContext();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />

      <div className={`min-h-screen transition-all duration-200 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <TopBar onMenuClick={toggleMobile} />
        <NotificationBanner notifications={notifications} />
        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
