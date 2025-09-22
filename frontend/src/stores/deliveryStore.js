import { create } from 'zustand';
import axios from '../utils/axios';

const useDeliveryStore = create((set, get) => ({
  // Estado
  deliveryFees: [],
  deliveryPersons: [],
  loading: false,
  error: null,

  // Acciones para tarifas de envío
  fetchDeliveryFees: async () => {
    console.log('🔄 fetchDeliveryFees iniciado');
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/delivery-fees');
      console.log('📦 Respuesta del API:', response.data);
      const data = response.data.success ? response.data.data : response.data;
      set({ 
        deliveryFees: data, 
        loading: false 
      });
      console.log('✅ deliveryFees actualizado en store:', data);
      return { success: true, data: data };
    } catch (error) {
      console.error('❌ Error al cargar tarifas de envío:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar tarifas',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Error al cargar tarifas' };
    }
  },

  createDeliveryFee: async (feeData) => {
    try {
      const response = await axios.post('/api/delivery-fees', feeData);
      set(state => ({
        deliveryFees: [...(Array.isArray(state.deliveryFees) ? state.deliveryFees : []), response.data]
      }));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error al crear tarifa:', error);
      set({ error: error.response?.data?.message || 'Error al crear tarifa' });
      return { success: false, error: error.response?.data?.message || 'Error al crear tarifa' };
    }
  },

  updateDeliveryFee: async (feeId, feeData) => {
    try {
      const response = await axios.put(`/api/delivery-fees/${feeId}`, feeData);
      set(state => ({
        deliveryFees: Array.isArray(state.deliveryFees) ? state.deliveryFees.map(fee => 
          fee.id === feeId ? response.data : fee
        ) : []
      }));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error al actualizar tarifa:', error);
      set({ error: error.response?.data?.message || 'Error al actualizar tarifa' });
      return { success: false, error: error.response?.data?.message || 'Error al actualizar tarifa' };
    }
  },

  deleteDeliveryFee: async (feeId) => {
    try {
      await axios.delete(`/api/delivery-fees/${feeId}`);
      set(state => ({
        deliveryFees: Array.isArray(state.deliveryFees) ? state.deliveryFees.filter(fee => fee.id !== feeId) : []
      }));
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar tarifa:', error);
      set({ error: error.response?.data?.message || 'Error al eliminar tarifa' });
      return { success: false, error: error.response?.data?.message || 'Error al eliminar tarifa' };
    }
  },

  // Acciones para repartidores
  fetchDeliveryPersons: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/user-management?role=repartidor');
      const data = response.data.success ? response.data.data : response.data;
      set({ 
        deliveryPersons: data, 
        loading: false 
      });
      return { success: true, data: data };
    } catch (error) {
      console.error('Error al cargar repartidores:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar repartidores',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Error al cargar repartidores' };
    }
  },

  createDeliveryPerson: async (personData) => {
    try {
      const response = await axios.post('/api/user-management', personData);
      set(state => ({
        deliveryPersons: [...(Array.isArray(state.deliveryPersons) ? state.deliveryPersons : []), response.data.data]
      }));
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error al crear repartidor:', error);
      set({ error: error.response?.data?.message || 'Error al crear repartidor' });
      return { success: false, error: error.response?.data?.message || 'Error al crear repartidor' };
    }
  },

  updateDeliveryPerson: async (personId, personData) => {
    try {
      const response = await axios.put(`/api/user-management/${personId}`, personData);
      set(state => ({
        deliveryPersons: Array.isArray(state.deliveryPersons) ? state.deliveryPersons.map(person => 
          person.id === personId ? response.data.data : person
        ) : []
      }));
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error al actualizar repartidor:', error);
      set({ error: error.response?.data?.message || 'Error al actualizar repartidor' });
      return { success: false, error: error.response?.data?.message || 'Error al actualizar repartidor' };
    }
  },

  updateDeliveryPersonStatus: async (personId, status) => {
    try {
      await axios.patch(`/api/user-management/${personId}/toggle-status`, { isActive: status === 'available' });
      set(state => ({
        deliveryPersons: Array.isArray(state.deliveryPersons) ? state.deliveryPersons.map(person => 
          person.id === personId ? { ...person, isActive: status === 'available' } : person
        ) : []
      }));
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      set({ error: error.response?.data?.message || 'Error al actualizar estado' });
      return { success: false, error: error.response?.data?.message || 'Error al actualizar estado' };
    }
  },

  deleteDeliveryPerson: async (personId) => {
    try {
      await axios.delete(`/api/user-management/${personId}`);
      set(state => ({
        deliveryPersons: Array.isArray(state.deliveryPersons) ? state.deliveryPersons.filter(person => person.id !== personId) : []
      }));
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar repartidor:', error);
      set({ error: error.response?.data?.message || 'Error al eliminar repartidor' });
      return { success: false, error: error.response?.data?.message || 'Error al eliminar repartidor' };
    }
  },

  getAvailableDeliveryPersons: () => {
    const { deliveryPersons } = get();
    return Array.isArray(deliveryPersons) ? deliveryPersons.filter(person => person.isActive === true) : [];
  },

  getDeliveryStats: () => {
    const { deliveryPersons, deliveryFees } = get();
    
    // Validar que sean arrays antes de usar filter
    const persons = Array.isArray(deliveryPersons) ? deliveryPersons : [];
    const fees = Array.isArray(deliveryFees) ? deliveryFees : [];
    
    const totalPersons = persons.length;
    const availablePersons = persons.filter(person => person.isActive === true).length;
    const inactivePersons = persons.filter(person => person.isActive === false).length;
    
    const totalFees = fees.length;
    const activeFees = fees.filter(fee => fee.isActive).length;
    
    return {
      totalPersons,
      availablePersons,
      inactivePersons,
      totalFees,
      activeFees
    };
  },

  clearError: () => set({ error: null })
}));

export default useDeliveryStore;