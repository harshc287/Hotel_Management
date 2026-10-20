import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import Layout from './components/common/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public
import Home from './pages/Home.jsx';
import QRMenu from './pages/QRMenu.jsx';
import Menu from './pages/Menu.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import PaymentResult from './pages/PaymentResult.jsx';
import TrackOrder from './pages/TrackOrder.jsx';
import OrderHistory from './pages/OrderHistory.jsx';

// Auth
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Staff
import WaiterDashboard from './pages/WaiterDashboard.jsx';
import KitchenDashboard from './pages/KitchenDashboard.jsx';
import DeliveryDashboard from './pages/DeliveryDashboard.jsx';
import DeliveryDetails from './pages/DeliveryDetails.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import ManageMenu from './pages/ManageMenu.jsx';
import ManageTables from './pages/ManageTables.jsx';
import AllOrders from './pages/AllOrders.jsx';
import SalesReports from './pages/SalesReports.jsx';
import RestaurantSettings from './pages/RestaurantSettings.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import Payments from './pages/Payments.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <NotificationProvider>
            <Routes>
              <Route element={<Layout />}>
                {/* Public */}
                <Route index element={<Home />} />
                <Route path="/qr/:token" element={<QRMenu />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-result" element={<PaymentResult />} />
                <Route path="/track/:id" element={<TrackOrder />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Customer */}
                <Route path="/orders" element={<ProtectedRoute roles={['customer']}><OrderHistory /></ProtectedRoute>} />

                {/* Staff */}
                <Route path="/waiter" element={<ProtectedRoute roles={['waiter', 'manager', 'admin']}><WaiterDashboard /></ProtectedRoute>} />
                <Route path="/kitchen" element={<ProtectedRoute roles={['cook', 'manager', 'admin']}><KitchenDashboard /></ProtectedRoute>} />
                <Route path="/delivery" element={<ProtectedRoute roles={['delivery']}><DeliveryDashboard /></ProtectedRoute>} />
                <Route path="/delivery/:id" element={<ProtectedRoute roles={['delivery']}><DeliveryDetails /></ProtectedRoute>} />
                
                {/* Manager */}
                <Route path="/manager" element={<ProtectedRoute roles={['manager', 'admin']}><ManagerDashboard /></ProtectedRoute>} />
                <Route path="/manager/menu" element={<ProtectedRoute roles={['manager', 'admin']}><ManageMenu /></ProtectedRoute>} />
                <Route path="/manager/tables" element={<ProtectedRoute roles={['manager', 'admin']}><ManageTables /></ProtectedRoute>} />
                <Route path="/manager/orders" element={<ProtectedRoute roles={['manager', 'admin']}><AllOrders /></ProtectedRoute>} />
                <Route path="/manager/reports" element={<ProtectedRoute roles={['manager', 'admin']}><SalesReports /></ProtectedRoute>} />
                <Route path="/manager/settings" element={<ProtectedRoute roles={['manager', 'admin']}><RestaurantSettings /></ProtectedRoute>} />
                <Route path="/manager/payments" element={<ProtectedRoute roles={['manager', 'admin']}><Payments /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}