import { useAuth } from '../../context/useAuth';

export default function Home() {
  const { isAuthenticated, user, roles, login, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>DLS Food Delivery</h1>
        <p>Please log in to continue.</p>
        <button onClick={login} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', fontSize: '1rem' }}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome, {user?.username ?? 'User'}</h1>
      <p>You are logged in.</p>
      <div style={{ marginTop: '1rem' }}>
        <h3>Your Roles</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {roles.map((role) => (
            <li key={role} style={{ padding: '0.25rem' }}>{role}</li>
          ))}
        </ul>
      </div>
      <button onClick={logout} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', fontSize: '1rem' }}>
        Logout
      </button>
    </div>
  );
}
