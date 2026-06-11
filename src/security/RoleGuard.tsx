import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

interface RoleGuardProps {
  requiredRoles: string[];
  children: ReactNode;
}

export default function RoleGuard({ requiredRoles, children }: RoleGuardProps) {
  const { roles } = useAuth();

  if (!requiredRoles.some((role) => roles.includes(role))) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          You do not have permission to view this page.{' '}
          <Link to="/" className="text-blue-600 hover:underline">
            Back to home
          </Link>
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
