import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../context/useAuth';

export default function LoginCallback() {
  const { initialized, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [initialized, isAuthenticated, navigate]);

  return <LoadingState title="Completing login" message="You'll be redirected shortly." />;
}
