
import { Route, Routes, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

import Layout from './components/common/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public pages
import Home from './pages/public/Home.jsx';
import Menu from './pages/public/Menu.jsx';
import QRMenu from './pages/public/QRMenu.jsx';
import NotFound from './pages/public/NotFound.jsx';

// Authentication
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// Cart and checkout
import Cart from './pages/cart/Cart.jsx';
import Checkout from './pages/cart/Checkout.jsx';

// Orders
import OrderDetails from './pages/orders/OrderDetails.jsx';
import OrderHistory from './pages/orders/OrderHistory.jsx';
import TrackOrder from './pages/orders/TrackOrder.jsx';

// Waiter
import WaiterDashboard from './pages/waiter/WaiterDashboard.jsx';

// Kitchen
import KitchenDashboard from './pages/kitchen/KitchenDashboard.jsx';

// Delivery
import DeliveryDashboard from './pages/delivery/DeliveryDashboard.jsx';
import DeliveryDetails from './pages/delivery/DeliveryDetails.jsx';

// Manager
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx';
import ManageMenu from './pages/manager/ManageMenu.jsx';
import ManageTables from './pages/manager/ManageTables.jsx';
import AllOrders from './pages/orders/AllOrders.jsx';
import SalesReports from './pages/manager/SalesReports.jsx';
import RestaurantSettings from './pages/manager/RestaurantSettings.jsx';

// Payments
import PaymentResult from './pages/payments/PaymentResult.jsx';
import Payments from './pages/payments/Payments.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/qr/:token" element={<QRMenu />} />
        <Route path="/menu" element={<Menu />} />

        {/* Cart and checkout */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Payment */}
        <Route path="/payment-result" element={<PaymentResult />} />

        {/* Public order tracking */}
        <Route path="/track/:id" element={<TrackOrder />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={['customer']}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        {/* Protected order details */}
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute roles={['customer', 'waiter', 'manager', 'admin']}>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        {/* Waiter */}
        <Route
          path="/waiter"
          element={
            <ProtectedRoute roles={['waiter', 'manager', 'admin']}>
              <WaiterDashboard />
            </ProtectedRoute>
          }
        />

        {/* Kitchen */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute roles={['cook', 'manager', 'admin']}>
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />

        {/* Delivery */}
        <Route
          path="/delivery"
          element={
            <ProtectedRoute roles={['delivery']}>
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delivery/:id"
          element={
            <ProtectedRoute roles={['delivery']}>
              <DeliveryDetails />
            </ProtectedRoute>
          }
        />

        {/* Manager */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute roles={['manager', 'admin']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/menu"
          element={
            <ProtectedRoute roles={['manager', 'admin']}>
              <ManageMenu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/tables"
          element={
            <ProtectedRoute roles={['manager', 'admin']}>
              <ManageTables />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/orders"
          element={
            <ProtectedRoute roles={['manager', 'admin']}>
              <AllOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/reports"
          element={
            <ProtectedRoute roles={['manager', 'admin']}>
              <SalesReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/settings"
          element={
            <ProtectedRoute roles={['manager', 'admin']}>
              <RestaurantSettings />
            </ProtectedRoute>
          }
        />

        {/* Payments */}
        <Route
          path="/manager/payments"
          element={
            <ProtectedRoute roles={['manager', 'admin']}>
              <Payments />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}
