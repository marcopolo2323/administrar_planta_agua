import { create } from 'zustand';
import axios from '../utils/axios';

export const useAuthStore = create((set, get) => ({
  // Estado
  token: localStorage.getItem('token') || null,
  user: null,
  loading: false,
  error: null,

  // Acciones
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({ token, user, loading: false });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al iniciar sesión',
        loading: false
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/auth/register', userData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al registrar usuario',
        loading: false
      });
      return false;
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