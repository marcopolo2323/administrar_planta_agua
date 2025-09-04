import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Páginas del cliente
import Login from '../pages/client/Login';
import Register from '../pages/client/Register';
import Dashboard from '../pages/client/Dashboard';
import NewOrder from '../pages/client/NewOrder';
import Orders from '../pages/client/Orders';
import OrderDetails from '../pages/client/OrderDetails';
import OrderTracking from '../pages/client/OrderTracking';
import Payment from '../pages/client/Payment';
import PaymentSuccess from '../pages/client/PaymentSuccess';
import EditProfile from '../pages/client/EditProfile';
import ChangePassword from '../pages/client/ChangePassword';

// Componente de protección de rutas
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Verificar si el usuario está autenticado y es un cliente
  if (!token || user.role !== 'cliente') {
    return <Navigate to="/client/login" replace />;
  }
  
  return children;
};

const ClientRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rutas protegidas */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/new-order" element={
        <ProtectedRoute>
          <NewOrder />
        </ProtectedRoute>
      } />
      
      <Route path="/orders" element={
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      } />
      
      <Route path="/orders/:id" element={
        <ProtectedRoute>
          <OrderDetails />
        </ProtectedRoute>
      } />
      
      <Route path="/track/:orderId" element={
        <ProtectedRoute>
          <OrderTracking />
        </ProtectedRoute>
      } />
      
      <Route path="/payment/:orderId" element={
        <ProtectedRoute>
          <Payment />
        </ProtectedRoute>
      } />
      
      <Route path="/payment-success/:orderId" element={
        <ProtectedRoute>
          <PaymentSuccess />
        </ProtectedRoute>
      } />
      
      <Route path="/profile/edit" element={
        <ProtectedRoute>
          <EditProfile />
        </ProtectedRoute>
      } />
      
      <Route path="/profile/change-password" element={
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      } />
      
      {/* Ruta por defecto - redirige al dashboard si está autenticado, o al login si no */}
      <Route path="/*" element={
        localStorage.getItem('token') && JSON.parse(localStorage.getItem('user') || '{}').role === 'cliente' ? 
          <Navigate to="/client/dashboard" replace /> : 
          <Navigate to="/client/login" replace />
      } />
    </Routes>
  );
};

export default ClientRoutes;