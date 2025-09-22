import { useEffect, useRef } from 'react';
import axios from '../utils/axios';

const useAutoRefresh = () => {
  const refreshIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const inactivityTimeoutRef = useRef(null);

  // Función para renovar el token
  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Decodificar el token para verificar si está próximo a expirar
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;

      // Si el token expira en menos de 2 horas, renovarlo
      if (timeUntilExpiry < 7200) {
        console.log('🔄 Renovando token JWT...');
        const response = await axios.post('/api/auth/refresh');
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log('✅ Token renovado exitosamente');
        }
      }
    } catch (error) {
      console.error('❌ Error al renovar token:', error);
      // Solo cerrar sesión si es un error de autenticación
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
  };

  // Función para detectar actividad del usuario
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Función para verificar inactividad
  const checkInactivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    const inactivityThreshold = 60 * 60 * 1000; // 1 hora en milisegundos

    if (timeSinceLastActivity > inactivityThreshold) {
      console.log('⏰ Sesión inactiva por más de 1 hora, cerrando sesión...');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  useEffect(() => {
    // Renovar token cada 30 minutos
    refreshIntervalRef.current = setInterval(refreshToken, 30 * 60 * 1000);

    // Verificar inactividad cada 10 minutos
    const inactivityInterval = setInterval(checkInactivity, 10 * 60 * 1000);

    // Eventos para detectar actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Limpiar al desmontar
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      clearInterval(inactivityInterval);
      
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  return { refreshToken };
};

export default useAutoRefresh;
