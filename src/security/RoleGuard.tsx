import type { ReactNode } from 'react';
import { ButtonLink } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { useAuth } from '../context/useAuth';

interface RoleGuardProps {
  requiredRoles: string[];
  children: ReactNode;
}

export default function RoleGuard({ requiredRoles, children }: RoleGuardProps) {
  const { roles } = useAuth();

  if (!requiredRoles.some((role) => roles.includes(role))) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          </CardHeader>
          <p className="text-sm text-slate-600">
            You do not have the required role to view this page.
          </p>
          <div className="mt-6">
            <ButtonLink to="/" variant="secondary" size="sm">
              Back to home
            </ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
