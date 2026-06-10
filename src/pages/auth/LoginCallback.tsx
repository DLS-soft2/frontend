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

  return <div>Completing login...</div>;
}
