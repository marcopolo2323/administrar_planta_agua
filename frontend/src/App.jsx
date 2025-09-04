import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { AuthProvider } from './contexts/AuthContext.jsx';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/products/Products';
import Clients from './pages/clients/Clients';
import Sales from './pages/sales/Sales';
import NewSale from './pages/sales/NewSale';
import SaleDetails from './pages/sales/SaleDetails';
import Reports from './pages/reports/Reports';
import POS from './pages/pos/POS';
import CashRegister from './pages/cashRegister/CashRegister';
import Credits from './pages/credits/Credits';
import GuestOrder from './pages/GuestOrder';
import TrackOrder from './pages/TrackOrder';
import GuestOrderManagement from './pages/admin/GuestOrderManagement';
import PaymentMethod from './pages/PaymentMethod';
import PaymentProcess from './pages/PaymentProcess';
import Receipt from './pages/Receipt';
import DeliveryFeeManagement from './pages/admin/DeliveryFeeManagement';

// Client Routes
import ClientRoutes from './routes/ClientRoutes';

const App = () => {
  const { token, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setLoading(false);
    };

    initAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Login />} />
          <Route path="guest-order" element={<GuestOrder />} />
          <Route path="track-order/:id" element={<TrackOrder />} />
          <Route path="payment-method/:orderId" element={<PaymentMethod />} />
          <Route path="payment-process/:id" element={<PaymentProcess />} />
          <Route path="receipt/:id" element={<Receipt />} />
        </Route>

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            token ? <DashboardLayout /> : <Navigate to="/" replace />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="clients" element={<Clients />} />
    <Route path="sales" element={<Sales />} />
    <Route path="sales/new" element={<NewSale />} />
    <Route path="sales/:id" element={<SaleDetails />} />
          <Route path="reports" element={<Reports />} />
          <Route path="pos" element={<POS />} />
          <Route path="cash-register" element={<CashRegister />} />
          <Route path="credits" element={<Credits />} />
          <Route path="guest-orders" element={<GuestOrderManagement />} />
          <Route path="delivery-fees" element={<DeliveryFeeManagement />} />
        </Route>

        {/* Rutas de cliente */}
        <Route path="/client/*" element={<ClientRoutes />} />

        {/* Ruta para cualquier otra dirección */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;