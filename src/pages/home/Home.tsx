import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/useAuth';

interface RoleAction {
  role: string;
  to: string;
  title: string;
  description: string;
}

const roleActions: RoleAction[] = [
  {
    role: 'customer',
    to: '/restaurants',
    title: 'Browse restaurants',
    description: 'Discover open kitchens near you and build your next order.',
  },
  {
    role: 'customer',
    to: '/orders',
    title: 'My orders',
    description: 'Track active deliveries and revisit past orders.',
  },
  {
    role: 'customer',
    to: '/profile',
    title: 'My profile',
    description: 'Manage your account details and delivery preferences.',
  },
  {
    role: 'courier',
    to: '/courier',
    title: 'Courier dashboard',
    description: 'See assigned deliveries and update their status.',
  },
  {
    role: 'restaurant',
    to: '/restaurant-dashboard',
    title: 'Restaurant dashboard',
    description: 'Manage your menu, opening hours, and incoming orders.',
  },
];

export default function Home() {
  const { isAuthenticated, user, roles, login } = useAuth();

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
          AAAB Food Delivery
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Fresh food, delivered fast
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
          Order from your favourite local restaurants and follow your delivery from kitchen to
          doorstep, all in one place.
        </p>
        <div className="mt-10">
          <Button onClick={login}>Log in to start ordering</Button>
        </div>
      </section>
    );
  }

  const actions = roleActions.filter((action) => roles.includes(action.role));

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {user?.firstName || user?.username || 'there'}
      </h1>
      <p className="mt-2 text-slate-600">What would you like to do today?</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <Card as="article" key={action.to}>
            <h2 className="text-lg font-semibold">{action.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{action.description}</p>
            <div className="mt-4">
              <ButtonLink to={action.to} variant="secondary" size="sm">
                {action.title}
              </ButtonLink>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
