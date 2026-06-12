import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../context/useAuth';

interface RoleAction {
  role: string;
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ICON = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
      {icon}
      {label}
    </span>
  );
}

const roleActions: RoleAction[] = [
  {
    role: 'customer',
    to: '/restaurants',
    title: 'Browse restaurants',
    description: 'Discover open kitchens near you and build your next order.',
    icon: <svg {...ICON}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" /></svg>,
  },
  {
    role: 'customer',
    to: '/orders',
    title: 'My orders',
    description: 'Track active deliveries and revisit past orders.',
    icon: <svg {...ICON}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></svg>,
  },
  {
    role: 'customer',
    to: '/profile',
    title: 'My profile',
    description: 'Manage your account details and delivery preferences.',
    icon: <svg {...ICON}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
  {
    role: 'courier',
    to: '/courier',
    title: 'Courier dashboard',
    description: 'See assigned deliveries and update their status.',
    icon: <svg {...ICON}><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  },
  {
    role: 'restaurant',
    to: '/restaurant-dashboard',
    title: 'Restaurant dashboard',
    description: 'Manage your menu, opening hours, and incoming orders.',
    icon: <svg {...ICON}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" /></svg>,
  },
];

export default function Home() {
  const { isAuthenticated, user, roles, login } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <header className="flex items-center justify-between px-6 py-4 sm:px-10">
          <div className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
            </svg>
            <span className="text-lg font-bold tracking-tight text-slate-900">AAAB</span>
          </div>
          <Button onClick={login} size="sm">Log in</Button>
        </header>

        <section className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              AAAB Food Delivery
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Fresh food, delivered fast
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
              Order from your favourite local restaurants and follow your delivery from kitchen to
              doorstep, all in one place.
            </p>
            <div className="mt-10">
              <Button onClick={login} className="px-8 py-3 text-base">
                Log in to start ordering
              </Button>
            </div>
            <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-3">
              <Pill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} label="Real-time tracking" />
              <Pill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>} label="Multi-role dashboard" />
              <Pill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 014 4c0 2-2 3-2 6H10c0-3-2-4-2-6a4 4 0 014-4z" /><path d="M10 18h4" /><path d="M10 22h4" /></svg>} label="AI-powered dispatch" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  const actions = roleActions.filter((action) => roles.includes(action.role));

  return (
    <section>
      <PageHeader
        title={`Welcome back, ${user?.firstName || user?.username || 'there'}`}
        subtitle="What would you like to do today?"
      />

      <div className="mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Card
            as="article"
            key={action.to}
            className="group hover:border-blue-200 hover:shadow-md transition-all"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
              {action.icon}
            </div>
            <h2 className="text-lg font-semibold">{action.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{action.description}</p>
            <div className="mt-4">
              <ButtonLink to={action.to} variant="secondary" size="sm">
                {action.title} &rarr;
              </ButtonLink>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
