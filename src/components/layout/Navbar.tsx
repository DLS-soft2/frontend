import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-gray-900">
            DLS Delivery
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/restaurants" className="text-sm text-gray-600 hover:text-gray-900">
                Restaurants
              </Link>
              <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900">
                My Orders
              </Link>
            </>
          )}
        </span>
        <div>
          {isAuthenticated ? (
            <span className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.username}</span>
              <button
                onClick={logout}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
              >
                Logout
              </button>
            </span>
          ) : (
            <button
              onClick={login}
              className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
