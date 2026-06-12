import type { ReactNode } from 'react';
import { LoadingState } from '../components/ui/LoadingState';
import { useAuth } from '../context/useAuth';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, initialized, login } = useAuth();

  if (!initialized) {
    return <LoadingState title="Loading" message="Initialising authentication..." />;
  }

  if (!isAuthenticated) {
    login();
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        <span className="text-sm">Redirecting to login...</span>
      </div>
    );
  }

  return <>{children}</>;
}
