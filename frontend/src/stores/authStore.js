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
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({ token, user, loading: false });
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
    if (!token) {
      set({ token: null, user: null });
      return false;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/auth/profile');
      set({ user: response.data, token });
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ token: null, user: null });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;