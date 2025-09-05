import { create } from 'zustand';
import axios from '../utils/axios';

const useDeliveryStore = create((set, get) => ({
  // Estado
  deliveryPersons: [],
  deliveryFees: [],
  deliveryOrders: [],
  loading: false,
  error: null,

  // Acciones para repartidores
  fetchDeliveryPersons: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/delivery-persons');
      set({ deliveryPersons: response.data, loading: false });
    } catch (error) {
      console.error('Error al cargar repartidores:', error);
      set({ error: error.message, loading: false });
    }
  },

  createDeliveryPerson: async (deliveryPersonData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/delivery-persons', deliveryPersonData);
      const newDeliveryPerson = response.data;
      
      set(state => ({
        deliveryPersons: [...state.deliveryPersons, newDeliveryPerson],
        loading: false
      }));
      
      return { success: true, data: newDeliveryPerson };
    } catch (error) {
      console.error('Error al crear repartidor:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  updateDeliveryPerson: async (deliveryPersonId, deliveryPersonData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/delivery-persons/${deliveryPersonId}`, deliveryPersonData);
      const updatedDeliveryPerson = response.data;
      
      set(state => ({
        deliveryPersons: state.deliveryPersons.map(deliveryPerson => 
          deliveryPerson.id === deliveryPersonId ? updatedDeliveryPerson : deliveryPerson
        ),
        loading: false
      }));
      
      return { success: true, data: updatedDeliveryPerson };
    } catch (error) {
      console.error('Error al actualizar repartidor:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  deleteDeliveryPerson: async (deliveryPersonId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/delivery-persons/${deliveryPersonId}`);
      
      set(state => ({
        deliveryPersons: state.deliveryPersons.filter(deliveryPerson => deliveryPerson.id !== deliveryPersonId),
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar repartidor:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Acciones para tarifas de envío
  fetchDeliveryFees: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/delivery-fees');
      set({ deliveryFees: response.data, loading: false });
    } catch (error) {
      console.error('Error al cargar tarifas de envío:', error);
      set({ error: error.message, loading: false });
    }
  },

  createDeliveryFee: async (deliveryFeeData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/delivery-fees', deliveryFeeData);
      const newDeliveryFee = response.data;
      
      set(state => ({
        deliveryFees: [...state.deliveryFees, newDeliveryFee],
        loading: false
      }));
      
      return { success: true, data: newDeliveryFee };
    } catch (error) {
      console.error('Error al crear tarifa de envío:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  updateDeliveryFee: async (deliveryFeeId, deliveryFeeData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/delivery-fees/${deliveryFeeId}`, deliveryFeeData);
      const updatedDeliveryFee = response.data;
      
      set(state => ({
        deliveryFees: state.deliveryFees.map(deliveryFee => 
          deliveryFee.id === deliveryFeeId ? updatedDeliveryFee : deliveryFee
        ),
        loading: false
      }));
      
      return { success: true, data: updatedDeliveryFee };
    } catch (error) {
      console.error('Error al actualizar tarifa de envío:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  deleteDeliveryFee: async (deliveryFeeId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/delivery-fees/${deliveryFeeId}`);
      
      set(state => ({
        deliveryFees: state.deliveryFees.filter(deliveryFee => deliveryFee.id !== deliveryFeeId),
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar tarifa de envío:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Acciones para pedidos de reparto
  fetchDeliveryOrders: async (deliveryPersonId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/delivery-orders/${deliveryPersonId}`);
      set({ deliveryOrders: response.data, loading: false });
    } catch (error) {
      console.error('Error al cargar pedidos de reparto:', error);
      set({ error: error.message, loading: false });
    }
  },

  updateDeliveryOrder: async (orderId, orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/delivery-orders/${orderId}`, orderData);
      const updatedOrder = response.data;
      
      set(state => ({
        deliveryOrders: state.deliveryOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        ),
        loading: false
      }));
      
      return { success: true, data: updatedOrder };
    } catch (error) {
      console.error('Error al actualizar pedido de reparto:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Filtros y búsqueda
  getFilteredDeliveryPersons: (searchTerm) => {
    const { deliveryPersons } = get();
    
    return deliveryPersons.filter(deliveryPerson => {
      const name = deliveryPerson.name.toLowerCase();
      const phone = deliveryPerson.phone ? deliveryPerson.phone.toLowerCase() : '';
      const email = deliveryPerson.email ? deliveryPerson.email.toLowerCase() : '';
      
      return name.includes(searchTerm.toLowerCase()) ||
             phone.includes(searchTerm.toLowerCase()) ||
             email.includes(searchTerm.toLowerCase());
    });
  },

  // Obtener tarifa por distrito
  getDeliveryFeeByDistrict: (district) => {
    const { deliveryFees } = get();
    return deliveryFees.find(fee => fee.district === district);
  },

  // Estadísticas
  getDeliveryStats: () => {
    const { deliveryPersons, deliveryOrders } = get();
    
    return {
      totalDeliveryPersons: deliveryPersons.length,
      activeDeliveryPersons: deliveryPersons.filter(dp => dp.active).length,
      totalDeliveryOrders: deliveryOrders.length,
      pendingDeliveryOrders: deliveryOrders.filter(order => order.status === 'en_camino').length,
      deliveredOrders: deliveryOrders.filter(order => order.status === 'entregado').length
    };
  },

  // Limpiar estado
  clearError: () => set({ error: null }),
  reset: () => set({ 
    deliveryPersons: [], 
    deliveryFees: [], 
    deliveryOrders: [], 
    loading: false, 
    error: null 
  })
}));

export default useDeliveryStore;
