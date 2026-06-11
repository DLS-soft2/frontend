import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/home/Home';
import LoginCallback from './pages/auth/LoginCallback';
import RestaurantList from './pages/restaurants/RestaurantList';
import RestaurantDetail from './pages/restaurants/RestaurantDetail';
import OrderCreate from './pages/orders/OrderCreate';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import RequireAuth from './security/RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}
