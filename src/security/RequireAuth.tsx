import type { ReactNode } from 'react';
import { useAuth } from '../context/useAuth';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, initialized, login } = useAuth();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    login();
    return <div>Redirecting to login...</div>;
  }

  return <>{children}</>;
}
