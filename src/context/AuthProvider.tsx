import { useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import keycloak from '../security/keycloak';
import { extractRoles, extractUser } from '../security/authUtils';
import { AuthContext } from './AuthContext';
import type { AuthState, AuthUser } from '../types/types';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [initialized, setInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const didInit = useRef(false);

  const updateAuthState = useCallback(() => {
    setIsAuthenticated(!!keycloak.authenticated);
    setToken(keycloak.token ?? null);
    setRoles(extractRoles(keycloak));
    setUser(extractUser(keycloak));
  }, []);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    }).then((authenticated) => {
      if (authenticated) {
        updateAuthState();
      }
      setInitialized(true);
    }).catch((error: unknown) => {
      console.error('Keycloak init failed', error);
      setInitialized(true);
    });

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).then(() => {
        updateAuthState();
      }).catch((error: unknown) => {
        console.error('Token refresh failed', error);
      });
    };

    keycloak.onAuthSuccess = () => {
      updateAuthState();
    };

    keycloak.onAuthLogout = () => {
      setIsAuthenticated(false);
      setToken(null);
      setRoles([]);
      setUser(null);
    };
  }, [updateAuthState]);

  const login = useCallback(() => {
    keycloak.login();
  }, []);

  const logout = useCallback(() => {
    keycloak.logout({ redirectUri: window.location.origin });
  }, []);

  const value: AuthState = {
    initialized,
    isAuthenticated,
    token,
    roles,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
