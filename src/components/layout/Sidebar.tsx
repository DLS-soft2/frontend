import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

interface NavItem {
  to: string;
  label: string;
  roles: string[];
  icon: React.ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const ICON = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function HomeIcon() {
  return <svg {...ICON}><path d="M3 12l9-9 9 9" /><path d="M9 21V12h6v9" /></svg>;
}
function UtensilsIcon() {
  return <svg {...ICON}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" /></svg>;
}
function ShoppingBagIcon() {
  return <svg {...ICON}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></svg>;
}
function TruckIcon() {
  return <svg {...ICON}><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
}
function BuildingIcon() {
  return <svg {...ICON}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" /></svg>;
}
function ShieldIcon() {
  return <svg {...ICON}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function UserIcon() {
  return <svg {...ICON}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function ChevronLeftIcon() {
  return <svg {...ICON}><path d="M15 18l-6-6 6-6" /></svg>;
}
function ChevronRightIcon() {
  return <svg {...ICON}><path d="M9 18l6-6-6-6" /></svg>;
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/', label: 'Home', roles: [], icon: <HomeIcon /> },
      { to: '/restaurants', label: 'Restaurants', roles: ['customer'], icon: <UtensilsIcon /> },
      { to: '/orders', label: 'My Orders', roles: ['customer'], icon: <ShoppingBagIcon /> },
      { to: '/profile', label: 'Profile', roles: ['customer'], icon: <UserIcon /> },
    ],
  },
  {
    label: 'Dashboards',
    items: [
      { to: '/courier', label: 'Courier Dispatch', roles: ['courier'], icon: <TruckIcon /> },
      { to: '/restaurant-dashboard', label: 'Restaurant Mgmt', roles: ['restaurant'], icon: <BuildingIcon /> },
      { to: '/admin', label: 'Admin', roles: ['admin'], icon: <ShieldIcon /> },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function linkClass(active: boolean, iconOnly: boolean): string {
  return [
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    active
      ? 'border-l-2 border-blue-400 bg-slate-800 text-white'
      : 'border-l-2 border-transparent text-slate-400 hover:bg-slate-800 hover:text-white',
    iconOnly ? 'justify-center' : '',
  ].join(' ');
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { roles } = useAuth();
  const location = useLocation();

  const isActive = (to: string) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  const filteredSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.length === 0 || item.roles.some((r) => roles.includes(r))),
  })).filter((section) => section.items.length > 0);

  function renderNav(iconOnly: boolean, ariaLabel: string) {
    return (
      <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label={ariaLabel}>
        {filteredSections.map((section) => (
          <div key={section.label}>
            {!iconOnly && (
              <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 first:mt-0">
                {section.label}
              </p>
            )}
            {iconOnly && <div className="mt-4 first:mt-0" />}
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={() => linkClass(isActive(item.to), iconOnly)}
                    title={iconOnly ? item.label : undefined}
                    onClick={onMobileClose}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!iconOnly && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    );
  }

  function renderBrand(showText: boolean) {
    return (
      <Link to="/" className="flex items-center gap-3 border-b border-slate-800 px-3 py-4" onClick={onMobileClose}>
        <img src="/logo.png" alt="AAAB" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
        {showText && <span className="text-lg font-bold tracking-tight text-white">AAAB</span>}
      </Link>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`fixed left-0 top-0 z-30 hidden h-screen lg:block ${collapsed ? 'w-16' : 'w-64'} transition-all duration-200`}>
        <div className={`flex h-full flex-col bg-slate-900 ${collapsed ? 'w-16' : 'w-64'} transition-all duration-200`}>
          {renderBrand(!collapsed)}
          {renderNav(collapsed, 'Sidebar')}
          <button
            onClick={onToggle}
            className="flex items-center justify-center border-t border-slate-800 py-3 text-slate-400 transition-colors hover:text-white"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onMobileClose} aria-hidden="true" />
          <aside className="fixed left-0 top-0 z-50 h-screen w-64 lg:hidden">
            <div className="flex h-full flex-col bg-slate-900 w-64">
              {renderBrand(true)}
              {renderNav(false, 'Mobile sidebar')}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
