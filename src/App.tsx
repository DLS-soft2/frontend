import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
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

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
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
      </AppLayout>
    </BrowserRouter>
  );
}
