import { create } from 'zustand';
import axios from '../utils/axios';

const useAuthStore = create((set, get) => ({
  // Estado
  token: localStorage.getItem('token') || null,
  user: null,
  loading: false,
  error: null,

  // Acciones
  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      // Intentar primero con el endpoint de repartidores
      let response;
      try {
        response = await axios.post('/api/delivery/login', { username, password });
      } catch (deliveryError) {
        // Si falla, intentar con el endpoint general
        response = await axios.post('/api/auth/login', { username, password });
      }
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Obtener el perfil completo del usuario para asegurar que tenemos todos los campos
      try {
        const profileResponse = await axios.get('/api/auth/profile');
        set({ token, user: profileResponse.data, loading: false });
      } catch (profileError) {
        // Si falla obtener el perfil, usar los datos del login
        set({ token, user, loading: false });
      }
      
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al iniciar sesión',
        loading: false
      });
      return { success: false, error: error.response?.data?.message || 'Error al iniciar sesión' };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/auth/register', userData);
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al registrar usuario',
        loading: false
      });
      return { success: false, error: error.response?.data?.message || 'Error al registrar usuario' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ token: null, user: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Token encontrado en localStorage:', !!token);
    
    if (!token) {
      console.log('❌ No hay token, usuario no autenticado');
      set({ token: null, user: null });
      return false;
    }

    try {
      console.log('🔄 Verificando token con el servidor...');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/auth/profile');
      console.log('✅ Token válido, usuario autenticado:', response.data);
      set({ user: response.data, token });
      return true;
    } catch (error) {
      console.error('❌ Token inválido o error del servidor:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Message:', error.response?.data?.message);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ token: null, user: null });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;