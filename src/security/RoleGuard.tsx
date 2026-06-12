import type { ReactNode } from 'react';
import { ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/useAuth';

interface RoleGuardProps {
  requiredRoles: string[];
  children: ReactNode;
}

export default function RoleGuard({ requiredRoles, children }: RoleGuardProps) {
  const { roles } = useAuth();

  if (!requiredRoles.some((role) => roles.includes(role))) {
    return (
      <div className="mx-auto mt-20 max-w-md text-center">
        <Card>
          <div className="flex justify-center text-slate-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Access Denied</h1>
          <p className="mt-2 text-sm text-slate-500">
            This page requires the <span className="font-medium text-slate-700">{requiredRoles.join(' or ')}</span> role.
          </p>
          <div className="mt-6">
            <ButtonLink to="/">Go home</ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
