import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from './stores/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrdersManagement from './pages/OrdersManagement';
import GuestOrderNew from './pages/GuestOrderNew';
import DeliveryFeesManagement from './pages/DeliveryFeesManagement';
import DeliveryPersonsManagement from './pages/DeliveryPersonsManagement';
import Receipt from './pages/Receipt';
import TrackOrder from './pages/TrackOrder';
import DeliveryDashboardNew from './pages/DeliveryDashboardNew';
import DeliveryLogin from './pages/DeliveryLogin';
import SubscriptionsManagement from './pages/SubscriptionsManagement';
import ValesManagement from './pages/ValesManagement';
import CollectionReport from './pages/CollectionReport';
import ClientsManagement from './pages/ClientsManagement';

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
        <Route path="/guest-order" element={<GuestOrderNew />} />
        <Route path="/receipt/:id" element={<Receipt />} />
        <Route path="/track/:id" element={<TrackOrder />} />

        {/* Rutas de login específicas */}
        <Route path="/delivery-login" element={<DeliveryLogin />} />

        {/* Rutas protegidas - Panel de administración (Admin y Vendedor) */}
        <Route
          path="/dashboard"
          element={
            token ? <DashboardLayout /> : <Navigate to="/" replace />
          }
        >
          <Route index element={<ProtectedRoute requiredRoles={['admin', 'vendedor']}><Dashboard /></ProtectedRoute>} />
          <Route path="orders-management" element={<ProtectedRoute requiredRoles={['admin']}><OrdersManagement /></ProtectedRoute>} />
          <Route path="delivery-fees" element={<ProtectedRoute requiredRoles={['admin']}><DeliveryFeesManagement /></ProtectedRoute>} />
          <Route path="delivery-persons" element={<ProtectedRoute requiredRoles={['admin']}><DeliveryPersonsManagement /></ProtectedRoute>} />
          <Route path="subscriptions" element={<ProtectedRoute requiredRoles={['admin']}><SubscriptionsManagement /></ProtectedRoute>} />
          <Route path="vales" element={<ProtectedRoute requiredRoles={['admin']}><ValesManagement /></ProtectedRoute>} />
          <Route path="collection-report" element={<ProtectedRoute requiredRoles={['admin']}><CollectionReport /></ProtectedRoute>} />
          <Route path="clients" element={<ProtectedRoute requiredRoles={['admin']}><ClientsManagement /></ProtectedRoute>} />
        </Route>

        {/* Ruta específica para repartidores */}
        <Route
          path="/delivery-dashboard"
          element={
            token ? <DashboardLayout /> : <Navigate to="/delivery-login" replace />
          }
        >
          <Route index element={<ProtectedRoute requiredRoles={['repartidor']}><DeliveryDashboardNew /></ProtectedRoute>} />
        </Route>


        {/* Ruta para cualquier otra dirección */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};

export default App;