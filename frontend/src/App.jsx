import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from './stores/authStore';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Credits from './pages/Credits';
import Sales from './pages/Sales';
import Orders from './pages/Orders';
import Notifications from './pages/Notifications';
import CashRegister from './pages/CashRegister';
import GuestOrder from './pages/GuestOrder';
import PaymentMethod from './pages/PaymentMethod';
import PaymentProcess from './pages/PaymentProcess';
import Receipt from './pages/Receipt';
import TrackOrder from './pages/TrackOrder';

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
          <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Login />} />
        </Route>

        {/* Rutas de clientes visitantes */}
        <Route path="/guest-order" element={<GuestOrder />} />
        <Route path="/payment-method" element={<PaymentMethod />} />
        <Route path="/payment-process" element={<PaymentProcess />} />
        <Route path="/receipt/:id" element={<Receipt />} />
        <Route path="/track/:id" element={<TrackOrder />} />

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
          <Route path="credits" element={<Credits />} />
          <Route path="sales" element={<Sales />} />
          <Route path="orders" element={<Orders />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="cash-register" element={<CashRegister />} />
        </Route>

        {/* Ruta para cualquier otra dirección */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};

export default App;