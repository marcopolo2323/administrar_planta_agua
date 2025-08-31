import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';

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
import Reports from './pages/reports/Reports';
import POS from './pages/pos/POS';
import CashRegister from './pages/cashRegister/CashRegister';
import Credits from './pages/credits/Credits';

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
        <Route path="reports" element={<Reports />} />
        <Route path="pos" element={<POS />} />
        <Route path="cash-register" element={<CashRegister />} />
        <Route path="credits" element={<Credits />} />
      </Route>

      {/* Ruta para cualquier otra dirección */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;