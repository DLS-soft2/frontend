import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Button } from '../ui/Button';

interface NavigationItem {
  to: string;
  label: string;
  roles: string[];
}

const navigationItems: NavigationItem[] = [
  { to: '/restaurants', label: 'Restaurants', roles: ['customer'] },
  { to: '/orders', label: 'My Orders', roles: ['customer'] },
  { to: '/profile', label: 'Profile', roles: ['customer'] },
  { to: '/courier', label: 'Courier dispatch', roles: ['courier'] },
  { to: '/restaurant-dashboard', label: 'Restaurant dashboard', roles: ['restaurant'] },
  { to: '/admin', label: 'Admin', roles: ['admin'] },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700',
    isActive ? 'bg-blue-100 text-blue-950' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
  ].join(' ');

function AaabBrandMark() {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <img
        src="/logo.png"
        alt="AAAB food delivery and courier dispatch logo"
        className="h-12 w-28 shrink-0 rounded-2xl object-contain"
      />
      <span className="min-w-0">
        <span className="block text-lg font-black tracking-tight text-slate-950">AAAB</span>
        <span className="hidden text-xs font-semibold uppercase tracking-wide text-orange-600 sm:block">
          Food delivery & courier dispatch system
        </span>
      </span>
    </span>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, roles, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const visibleItems = isAuthenticated
    ? navigationItems.filter((item) => item.roles.some((role) => roles.includes(role)))
    : [];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur" aria-label="Primary">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="min-w-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700" onClick={closeMenu}>
          <AaabBrandMark />
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {visibleItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <span className="max-w-44 truncate text-sm font-medium text-slate-700">{user?.username}</span>
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

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="lg:hidden"
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          Menu
        </Button>
      </div>

      {isMenuOpen && (
        <div id="mobile-navigation" className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {visibleItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={closeMenu}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            {isAuthenticated ? (
              <>
                <span className="min-w-0 truncate text-sm font-medium text-slate-700">{user?.username}</span>
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
      )}
    </nav>
  );
}
