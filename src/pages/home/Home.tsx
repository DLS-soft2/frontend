import { useAuth } from '../../context/useAuth';

export default function Home() {
  const { isAuthenticated, user, roles, login, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">DLS Food Delivery</h1>
        <p className="mt-2 text-gray-600">Please log in to continue.</p>
        <button
          onClick={login}
          className="mt-6 rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Welcome, {user?.username ?? 'User'}</h1>
      <p className="mt-2 text-gray-600">You are logged in.</p>
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Your Roles</h3>
        <ul className="mt-2">
          {roles.map((role) => (
            <li key={role} className="py-1 text-sm text-gray-600">
              {role}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={logout}
        className="mt-6 rounded border border-gray-300 px-6 py-2 font-medium hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  );
}
