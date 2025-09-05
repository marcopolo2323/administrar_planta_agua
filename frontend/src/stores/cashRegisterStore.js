import { create } from 'zustand';
import axios from '../utils/axios';

const useCashRegisterStore = create((set, get) => ({
  // Estado
  currentCashRegister: null,
  cashRegisterHistory: [],
  movements: [],
  stats: null,
  loading: false,
  error: null,

  // Acciones
  openCashRegister: async (openingAmount, notes) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/cash-register/open', {
        openingAmount,
        notes
      });
      
      if (response.data.success) {
        set({ 
          currentCashRegister: response.data.data,
          loading: false 
        });
        return { success: true, data: response.data.data };
      } else {
        set({ 
          error: response.data.message,
          loading: false 
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al abrir caja';
      set({ 
        error: errorMessage,
        loading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  closeCashRegister: async (closingAmount, notes) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/cash-register/close', {
        closingAmount,
        notes
      });
      
      if (response.data.success) {
        set({ 
          currentCashRegister: null,
          loading: false 
        });
        return { success: true, data: response.data.data };
      } else {
        set({ 
          error: response.data.message,
          loading: false 
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cerrar caja';
      set({ 
        error: errorMessage,
        loading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  fetchCurrentCashRegister: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/cash-register/current');
      
      if (response.data.success) {
        set({ 
          currentCashRegister: response.data.data,
          movements: response.data.data?.movements || [],
          loading: false 
        });
        return { success: true, data: response.data.data };
      } else {
        set({ 
          error: response.data.message,
          loading: false 
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al obtener caja actual';
      set({ 
        error: errorMessage,
        loading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  fetchCashRegisterHistory: async (page = 1, limit = 10, status = null) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (status) {
        params.append('status', status);
      }

      const response = await axios.get(`/api/cash-register/history?${params}`);
      
      if (response.data.success) {
        set({ 
          cashRegisterHistory: response.data.data,
          loading: false 
        });
        return { success: true, data: response.data.data, pagination: response.data.pagination };
      } else {
        set({ 
          error: response.data.message,
          loading: false 
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al obtener historial';
      set({ 
        error: errorMessage,
        loading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  addCashMovement: async (movementData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/cash-register/movement', movementData);
      
      if (response.data.success) {
        // Actualizar movimientos locales
        const currentMovements = get().movements;
        set({ 
          movements: [response.data.data, ...currentMovements],
          loading: false 
        });
        return { success: true, data: response.data.data };
      } else {
        set({ 
          error: response.data.message,
          loading: false 
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al agregar movimiento';
      set({ 
        error: errorMessage,
        loading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  fetchStats: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axios.get(`/api/cash-register/stats?${params}`);
      
      if (response.data.success) {
        set({ 
          stats: response.data.data,
          loading: false 
        });
        return { success: true, data: response.data.data };
      } else {
        set({ 
          error: response.data.message,
          loading: false 
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al obtener estadísticas';
      set({ 
        error: errorMessage,
        loading: false 
      });
      return { success: false, error: errorMessage };
    }
  },

  getFilteredMovements: (searchTerm = '') => {
    const { movements } = get();
    if (!searchTerm) return movements;
    
    return movements.filter(movement =>
      movement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movement.reference && movement.reference.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  },

  getMovementsByType: (type) => {
    const { movements } = get();
    return movements.filter(movement => movement.type === type);
  },

  getTotalByType: (type) => {
    const { movements } = get();
    return movements
      .filter(movement => movement.type === type)
      .reduce((sum, movement) => sum + parseFloat(movement.amount), 0);
  },

  getCurrentBalance: () => {
    const { currentCashRegister, movements } = get();
    if (!currentCashRegister) return 0;

    const totalIngresos = movements
      .filter(m => m.type === 'ingreso' || m.type === 'venta')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    const totalEgresos = movements
      .filter(m => m.type === 'egreso' || m.type === 'gasto' || m.type === 'retiro')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    return parseFloat(currentCashRegister.openingAmount) + totalIngresos - totalEgresos;
  },

  clearError: () => set({ error: null })
}));

export default useCashRegisterStore;