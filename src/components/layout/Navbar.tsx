import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e5e4e7' }}>
      <Link to="/" style={{ textDecoration: 'none', fontSize: '1.25rem', fontWeight: 'bold', color: 'inherit' }}>
        DLS Delivery
      </Link>
      <div>
        {isAuthenticated ? (
          <span style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>{user?.username}</span>
            <button onClick={logout}>Logout</button>
          </span>
        ) : (
          <button onClick={login}>Login</button>
        )}
      </div>
    </nav>
  );
}
