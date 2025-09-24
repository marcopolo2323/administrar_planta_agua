import React from 'react';
import { useOffline } from '../hooks/useOffline';
import ErrorPage from '../pages/ErrorPage';

const NetworkErrorBoundary = ({ children }) => {
  const isOffline = useOffline();

  // Solo mostrar página de error si está realmente offline
  if (isOffline) {
    return (
      <ErrorPage 
        type="offline"
        title="Sin conexión a internet"
        description="Parece que te has desconectado del mundo digital. Verifica tu conexión e intenta nuevamente."
        showRetry={true}
      />
    );
  }

  return children;
};

export default NetworkErrorBoundary;
