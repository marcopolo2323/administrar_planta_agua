import { create } from 'zustand';
import axios from '../utils/axios';

export const useCashRegisterStore = create((set, get) => ({
  currentCashRegister: null,
  cashRegisterHistory: [],
  selectedCashRegister: null,
  loading: false,
  error: null,
  
  // Obtener la caja actual
  fetchCurrentCashRegister: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/api/cash-register/current');
      
      // Verificar si la respuesta contiene datos de caja
      if (response.data && response.data.cashRegister) {
        set({ currentCashRegister: response.data.cashRegister, loading: false });
        return response.data.cashRegister;
      } else {
        // No hay caja abierta, pero no es un error
        set({ currentCashRegister: null, loading: false, error: null });
        return null;
      }
    } catch (error) {
      console.error('Error al obtener caja actual:', error);
      
      // Si el error es 404, significa que no hay caja abierta, lo cual no es un error real
      if (error.response && error.response.status === 404) {
        set({ currentCashRegister: null, loading: false, error: null });
        return null;
      }
      
      set({ 
        error: error.response?.data?.message || 'Error al cargar la caja actual', 
        loading: false 
      });
      return null;
    }
  },
  
  // Obtener el historial de cajas
  fetchCashRegisterHistory: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      
      let url = '/api/cash-register/history';
      const params = {};
      
      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }
      
      const response = await axios.get(url, { params });
      set({ cashRegisterHistory: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar el historial de cajas', 
        loading: false 
      });
      return [];
    }
  },
  
  // Obtener detalles de una caja específica
  fetchCashRegisterDetails: async (cashRegisterId) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(`/api/cash-register/${cashRegisterId}`);
      set({ selectedCashRegister: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar los detalles de la caja', 
        loading: false 
      });
      return null;
    }
  },
  
  // Abrir una nueva caja
  openCashRegister: async (openingData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/api/cash-register/open', openingData);
      set({ currentCashRegister: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al abrir la caja', 
        loading: false 
      });
      return null;
    }
  },
  
  // Cerrar la caja actual
  closeCashRegister: async (closingData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/api/cash-register/close', closingData);
      set({ currentCashRegister: null, loading: false });
      
      // Actualizar el historial después de cerrar la caja
      await get().fetchCashRegisterHistory();
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cerrar la caja', 
        loading: false 
      });
      return null;
    }
  },
  
  // Registrar un movimiento de caja
  registerCashMovement: async (movementData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/api/cash-register/movement', movementData);
      
      // Actualizar la caja actual después de registrar el movimiento
      await get().fetchCurrentCashRegister();
      
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al registrar el movimiento', 
        loading: false 
      });
      return null;
    }
  },
  
  // Limpiar errores
  clearError: () => set({ error: null }),
  
  // Limpiar la caja seleccionada
  clearSelectedCashRegister: () => set({ selectedCashRegister: null }),
}));