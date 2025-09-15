import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from './stores/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ClientLayout from './layouts/ClientLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Sales from './pages/Sales';
import Orders from './pages/Orders';
import OrdersManagement from './pages/OrdersManagement';
import GuestOrderNew from './pages/GuestOrderNew';
import GuestOrder from './pages/GuestOrder';
import DeliveryFeesManagement from './pages/DeliveryFeesManagement';
import DeliveryPersonsManagement from './pages/DeliveryPersonsManagement';
import Reports from './pages/Reports';
import PaymentMethod from './pages/PaymentMethod';
import PaymentProcess from './pages/PaymentProcess';
import Receipt from './pages/Receipt';
import TrackOrder from './pages/TrackOrder';
import DeliveryDashboardNew from './pages/DeliveryDashboardNew';
import DeliveryLogin from './pages/DeliveryLogin';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import ClientDashboard from './pages/ClientDashboard';
import ClientOrder from './pages/ClientOrder';
import ClientPayments from './pages/ClientPayments';
import ClientPaymentsAdmin from './pages/ClientPaymentsAdmin';
import Subscriptions from './pages/Subscriptions';
import SubscriptionOrder from './pages/SubscriptionOrder';
import SubscriptionsManagement from './pages/SubscriptionsManagement';
import Documents from './pages/Documents';
import CreditsManagement from './pages/CreditsManagement';

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
        <Route path="/guest-order-old" element={<GuestOrder />} />
        <Route path="/payment-method-old" element={<PaymentMethod />} />
        <Route path="/payment-process-old" element={<PaymentProcess />} />
        <Route path="/receipt/:id" element={<Receipt />} />
        <Route path="/track/:id" element={<TrackOrder />} />

        {/* Rutas de login específicas */}
        <Route path="/delivery-login" element={<DeliveryLogin />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/client-register" element={<ClientRegister />} />

        {/* Rutas protegidas - Panel de administración (Admin y Vendedor) */}
        <Route
          path="/dashboard"
          element={
            token ? <DashboardLayout /> : <Navigate to="/" replace />
          }
        >
          <Route index element={<ProtectedRoute requiredRoles={['admin', 'vendedor']}><Dashboard /></ProtectedRoute>} />
          <Route path="products" element={<ProtectedRoute requiredRoles={['admin', 'vendedor']}><Products /></ProtectedRoute>} />
          <Route path="clients" element={<ProtectedRoute requiredRoles={['admin', 'vendedor']}><Clients /></ProtectedRoute>} />
          <Route path="sales" element={<ProtectedRoute requiredRoles={['admin', 'vendedor']}><Sales /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute requiredRoles={['admin', 'vendedor']}><Orders /></ProtectedRoute>} />
          <Route path="orders-management" element={<ProtectedRoute requiredRoles={['admin']}><OrdersManagement /></ProtectedRoute>} />
          <Route path="guest-orders" element={<ProtectedRoute requiredRoles={['admin', 'vendedor']}><Orders /></ProtectedRoute>} />
          <Route path="delivery-fees" element={<ProtectedRoute requiredRoles={['admin']}><DeliveryFeesManagement /></ProtectedRoute>} />
          <Route path="delivery-persons" element={<ProtectedRoute requiredRoles={['admin']}><DeliveryPersonsManagement /></ProtectedRoute>} />
          <Route path="client-payments" element={<ProtectedRoute requiredRoles={['admin']}><ClientPaymentsAdmin /></ProtectedRoute>} />
          <Route path="subscriptions" element={<ProtectedRoute requiredRoles={['admin']}><SubscriptionsManagement /></ProtectedRoute>} />
          <Route path="credits" element={<ProtectedRoute requiredRoles={['admin']}><CreditsManagement /></ProtectedRoute>} />
          <Route path="documents" element={<ProtectedRoute requiredRoles={['admin']}><Documents /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute requiredRoles={['admin']}><Reports /></ProtectedRoute>} />
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

        {/* Ruta específica para clientes */}
        <Route
          path="/client-dashboard"
          element={
            token ? <ClientLayout /> : <Navigate to="/client-login" replace />
          }
        >
          <Route index element={<ProtectedRoute requiredRoles={['cliente']}><ClientDashboard /></ProtectedRoute>} />
          <Route path="order" element={<ProtectedRoute requiredRoles={['cliente']}><ClientOrder /></ProtectedRoute>} />
          <Route path="payments" element={<ProtectedRoute requiredRoles={['cliente']}><ClientPayments /></ProtectedRoute>} />
          <Route path="subscriptions" element={<ProtectedRoute requiredRoles={['cliente']}><Subscriptions /></ProtectedRoute>} />
          <Route path="subscription-order" element={<ProtectedRoute requiredRoles={['cliente']}><SubscriptionOrder /></ProtectedRoute>} />
        </Route>

        {/* Ruta para cualquier otra dirección */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};

export default App;