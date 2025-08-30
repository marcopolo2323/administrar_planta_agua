import { create } from 'zustand';
import axios from '../utils/axios';

export const useCreditStore = create((set, get) => ({
  credits: [],
  loading: false,
  error: null,
  selectedCredit: null,
  payments: [],
  
  // Obtener todos los créditos
  fetchCredits: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      
      let url = '/api/credits';
      const params = {};
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      if (filters.clientId) {
        params.clientId = filters.clientId;
      }
      
      const response = await axios.get(url, { params });
      set({ credits: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar los créditos', 
        loading: false 
      });
      return [];
    }
  },
  
  // Obtener créditos vencidos
  fetchOverdueCredits: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/api/credits/overdue');
      set({ credits: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar los créditos vencidos', 
        loading: false 
      });
      return [];
    }
  },
  
  // Obtener un crédito por ID
  fetchCreditById: async (creditId) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(`/api/credits/${creditId}`);
      set({ selectedCredit: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar el crédito', 
        loading: false 
      });
      return null;
    }
  },
  
  // Obtener pagos de un crédito
  fetchCreditPayments: async (creditId) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(`/api/credits/${creditId}/payments`);
      set({ payments: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar los pagos del crédito', 
        loading: false 
      });
      return [];
    }
  },
  
  // Registrar un pago
  registerPayment: async (creditId, paymentData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post(`/api/credits/${creditId}/payments`, paymentData);
      
      // Actualizar la lista de créditos después de registrar el pago
      await get().fetchCredits();
      
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al registrar el pago', 
        loading: false 
      });
      return null;
    }
  },
  
  // Crear un nuevo crédito
  createCredit: async (creditData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/api/credits', creditData);
      
      // Actualizar la lista de créditos después de crear uno nuevo
      await get().fetchCredits();
      
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al crear el crédito', 
        loading: false 
      });
      return null;
    }
  },
  
  // Limpiar errores
  clearError: () => set({ error: null }),
  
  // Limpiar el crédito seleccionado
  clearSelectedCredit: () => set({ selectedCredit: null }),
  
  // Limpiar los pagos
  clearPayments: () => set({ payments: [] }),
}));