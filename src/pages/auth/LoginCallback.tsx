import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export default function LoginCallback() {
  const { initialized, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [initialized, isAuthenticated, navigate]);

  return <div className="mx-auto max-w-3xl text-center text-slate-600">Completing login...</div>;
}
