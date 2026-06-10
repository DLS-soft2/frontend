export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthState {
  initialized: boolean;
  isAuthenticated: boolean;
  token: string | null;
  roles: string[];
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
}
