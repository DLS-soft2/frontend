import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/home/Home';
import LoginCallback from './pages/auth/LoginCallback';
import RestaurantList from './pages/restaurants/RestaurantList';
import RestaurantDetail from './pages/restaurants/RestaurantDetail';
import OrderCreate from './pages/orders/OrderCreate';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import UserProfile from './pages/profile/UserProfile';
import CourierDashboard from './pages/dashboard/CourierDashboard';
import RestaurantDashboard from './pages/dashboard/RestaurantDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import PaymentStatus from './pages/payments/PaymentStatus';
import RequireAuth from './security/RequireAuth';
import RoleGuard from './security/RoleGuard';
import NotificationBanner from './components/ui/NotificationBanner';
import { useAuth } from './context/useAuth';
import { useNotificationContext } from './context/useNotificationContext';

export default function App() {
  const { isAuthenticated } = useAuth();
  const { notifications } = useNotificationContext();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        {isAuthenticated && <NotificationBanner notifications={notifications} />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/callback" element={<LoginCallback />} />
          <Route
            path="/restaurants"
            element={
              <RequireAuth>
                <RestaurantList />
              </RequireAuth>
            }
          />
          <Route
            path="/restaurants/:restaurantId"
            element={
              <RequireAuth>
                <RestaurantDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/orders/new"
            element={
              <RequireAuth>
                <OrderCreate />
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <OrderList />
              </RequireAuth>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <RequireAuth>
                <OrderDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/orders/:orderId/payments"
            element={
              <RequireAuth>
                <PaymentStatus />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <UserProfile />
              </RequireAuth>
            }
          />
          <Route
            path="/courier"
            element={
              <RequireAuth>
                <RoleGuard requiredRoles={['courier']}>
                  <CourierDashboard />
                </RoleGuard>
              </RequireAuth>
            }
          />
          <Route
            path="/restaurant-dashboard"
            element={
              <RequireAuth>
                <RoleGuard requiredRoles={['restaurant']}>
                  <RestaurantDashboard />
                </RoleGuard>
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RoleGuard requiredRoles={['admin']}>
                  <AdminDashboard />
                </RoleGuard>
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
