import React from 'react';
import { useSystemExpiry } from '../hooks/useSystemExpiry';
import SystemExpired from './SystemExpired';

const SystemExpiryGuard = ({ children }) => {
  const { isExpired, isLoading } = useSystemExpiry();

  // Mostrar loading mientras se verifica
  if (isLoading) {
    return null; // O un componente de loading si prefieres
  }

  // Si está expirado, mostrar pantalla de expiración
  if (isExpired) {
    return <SystemExpired />;
  }

  // Si no está expirado, mostrar el contenido normal
  return children;
};

export default SystemExpiryGuard;
