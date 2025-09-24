import { create } from 'zustand';
import axios from '../utils/axios';

const useGuestOrderStore = create((set, get) => ({
  // Estado
  orders: [],
  loading: false,
  error: null,

  // Acciones
  createGuestOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      console.log('Enviando datos al backend:', orderData);
      const response = await axios.post('/api/guest-orders', orderData);
      console.log('Respuesta completa del servidor:', response);
      console.log('Datos de la respuesta:', response.data);
      
      // El backend devuelve { success: true, data: {...} }
      const newOrder = response.data.data;
      console.log('Procesando respuesta - newOrder:', newOrder);
      
      set(state => ({
        orders: Array.isArray(state.orders) ? [...state.orders, newOrder] : [newOrder],
        loading: false
      }));
      
      return { success: true, data: newOrder };
    } catch (error) {
      console.error('Error al crear pedido de invitado:', error);
      console.error('Detalles del error:', error.response?.data);
      set({ 
        error: error.response?.data?.message || 'Error al crear pedido',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Error al crear pedido' };
    }
  },

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/guest-orders?limit=1000');
      console.log('Respuesta completa del servidor:', response);
      console.log('Datos de la respuesta:', response.data);
      
      // El backend devuelve { success: true, data: [...] }
      const orders = response.data.success ? response.data.data : response.data;
      console.log('Procesando pedidos:', orders);
      
      set({ 
        orders: Array.isArray(orders) ? orders : [], 
        loading: false 
      });
      return { success: true, data: orders };
    } catch (error) {
      console.error('Error al cargar pedidos de invitados:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar pedidos',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Error al cargar pedidos' };
    }
  },

  // Nueva función para actualización silenciosa (sin loading)
  fetchOrdersSilently: async () => {
    try {
      const response = await axios.get('/api/guest-orders?limit=1000');
      console.log('🔄 Actualización silenciosa de pedidos');
      
      // El backend devuelve { success: true, data: [...] }
      const orders = response.data.success ? response.data.data : response.data;
      
      set({ 
        orders: Array.isArray(orders) ? orders : []
        // No cambiamos loading, mantiene su estado actual
      });
      return { success: true, data: orders };
    } catch (error) {
      console.error('Error en actualización silenciosa:', error);
      return { success: false, error: error.response?.data?.message || 'Error al actualizar pedidos' };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await axios.put(`/api/guest-orders/${orderId}/status`, { status });
      
      set(state => ({
        orders: Array.isArray(state.orders) ? state.orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        ) : []
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      set({ error: error.response?.data?.message || 'Error al actualizar estado' });
      return { success: false, error: error.response?.data?.message || 'Error al actualizar estado' };
    }
  },

  updateGuestOrder: async (orderId, updateData) => {
    set({ loading: true, error: null });
    try {
      // Si se está asignando un repartidor, usar el endpoint específico
      if (updateData.deliveryPersonId) {
        console.log('🔍 Asignando repartidor - Enviando petición:', {
          url: `/api/guest-orders/${orderId}/assign-delivery`,
          data: { deliveryPersonId: updateData.deliveryPersonId },
          headers: axios.defaults.headers.common
        });
        
        const response = await axios.put(`/api/guest-orders/${orderId}/assign-delivery`, {
          deliveryPersonId: updateData.deliveryPersonId
        });
        const updatedOrder = response.data.data;
        
        console.log('🔍 Asignación de repartidor - Respuesta recibida:', response.data);
        console.log('🔍 Asignación de repartidor - updatedOrder:', updatedOrder);
        
        set(state => ({
          orders: Array.isArray(state.orders) ? state.orders.map(order => 
            order.id === orderId ? { ...order, ...updatedOrder } : order
          ) : [],
          loading: false
        }));
        
        return { success: true, data: updatedOrder };
      } else {
        // Para otras actualizaciones, usar el endpoint general
        console.log('🔍 updateGuestOrder - Enviando petición:', {
          url: `/api/guest-orders/${orderId}`,
          data: updateData,
          headers: axios.defaults.headers.common
        });
        
        const response = await axios.put(`/api/guest-orders/${orderId}`, updateData);
        const updatedOrder = response.data;
        
        console.log('🔍 updateGuestOrder - Respuesta recibida:', response.data);
        console.log('🔍 updateGuestOrder - updatedOrder:', updatedOrder);
        
        set(state => ({
          orders: Array.isArray(state.orders) ? state.orders.map(order => 
            order.id === orderId ? { ...order, ...updatedOrder } : order
          ) : [],
          loading: false
        }));
        
        return { success: true, data: updatedOrder };
      }
    } catch (error) {
      console.error('Error al actualizar pedido de invitado:', error);
      set({ 
        error: error.response?.data?.message || 'Error al actualizar pedido',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Error al actualizar pedido' };
    }
  },

  getOrderById: (orderId) => {
    const { orders } = get();
    return Array.isArray(orders) ? orders.find(order => order.id === orderId) : null;
  },

  getOrdersByStatus: (status) => {
    const { orders } = get();
    return Array.isArray(orders) ? orders.filter(order => order.status === status) : [];
  },

  getOrderStats: () => {
    const { orders } = get();
    if (!Array.isArray(orders)) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        delivered: 0,
        cancelled: 0
      };
    }

    return {
      total: orders.length,
      pending: orders.filter(order => order.status === 'pendiente').length,
      inProgress: orders.filter(order => order.status === 'en_camino').length,
      delivered: orders.filter(order => order.status === 'entregado').length,
      cancelled: orders.filter(order => order.status === 'cancelado').length
    };
  },

  clearError: () => set({ error: null })
}));

export default useGuestOrderStore;
