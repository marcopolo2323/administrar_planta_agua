import { createContext, useContext, useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  // Usar el store de Zustand
  const { 
    token, 
    user, 
    loading, 
    error, 
    login, 
    logout, 
    register, 
    checkAuth, 
    clearError 
  } = useAuthStore();

  // Crear un objeto de autenticación para mantener compatibilidad con el código existente
  const auth = {
    token,
    user,
    loading,
    error,
    isAuthenticated: !!token,
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Proporcionar el contexto con los valores del store de Zustand
  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        register,
        checkAuth,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;