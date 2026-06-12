import { useAuth } from '../../context/useAuth';
import { useNotificationContext } from '../../context/useNotificationContext';
import { Button } from '../ui/Button';

function MenuIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

function BellDotIcon({ hasUnread }: { hasUnread: boolean }) {
  return (
    <span className="relative inline-flex">
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {hasUnread && (
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
      )}
    </span>
  );
}

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { isAuthenticated, user, login, logout } = useAuth();
  const { notifications } = useNotificationContext();
  const hasUnread = notifications.length > 0;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <BellDotIcon hasUnread={hasUnread} />
              <span className="max-w-40 truncate text-sm font-medium text-slate-700">
                {user?.firstName || user?.username}
              </span>
              <Button type="button" variant="secondary" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button type="button" size="sm" onClick={login}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
