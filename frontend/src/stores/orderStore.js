import { create } from 'zustand';
import axios from '../utils/axios';

const useOrderStore = create((set, get) => ({
  // Estado
  orders: [],
  loading: false,
  error: null,

  // Acciones
  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/orders');
      set({ orders: response.data, loading: false });
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      set({ error: error.message, loading: false });
    }
  },

  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/orders', orderData);
      const newOrder = response.data;
      
      set(state => ({
        orders: [...state.orders, newOrder],
        loading: false
      }));
      
      return { success: true, data: newOrder };
    } catch (error) {
      console.error('Error al crear pedido:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  updateOrder: async (orderId, orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/orders/${orderId}`, orderData);
      const updatedOrder = response.data;
      
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ),
        loading: false
      }));
      
      return { success: true, data: updatedOrder };
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  deleteOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/orders/${orderId}`);
      
      set(state => ({
        orders: state.orders.filter(order => order.id !== orderId),
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Filtros y búsqueda
  getFilteredOrders: (searchTerm) => {
    const { orders } = get();
    
    return orders.filter(order => {
      const deliveryAddress = order.deliveryAddress ? order.deliveryAddress.toLowerCase() : '';
      const contactPhone = order.contactPhone ? order.contactPhone.toLowerCase() : '';
      const notes = order.notes ? order.notes.toLowerCase() : '';
      
      return deliveryAddress.includes(searchTerm.toLowerCase()) ||
             contactPhone.includes(searchTerm.toLowerCase()) ||
             notes.includes(searchTerm.toLowerCase());
    });
  },

  // Obtener pedido por ID
  getOrderById: (orderId) => {
    const { orders } = get();
    return orders.find(order => order.id === orderId);
  },

  // Filtrar por estado
  getOrdersByStatus: (status) => {
    const { orders } = get();
    return orders.filter(order => order.status === status);
  },

  // Estadísticas
  getOrderStats: () => {
    const { orders } = get();
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pendiente').length;
    const confirmedOrders = orders.filter(order => order.status === 'confirmado').length;
    const inProgressOrders = orders.filter(order => order.status === 'en_preparacion').length;
    const onTheWayOrders = orders.filter(order => order.status === 'en_camino').length;
    const deliveredOrders = orders.filter(order => order.status === 'entregado').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelado').length;
    
    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      inProgressOrders,
      onTheWayOrders,
      deliveredOrders,
      cancelledOrders
    };
  },

  // Limpiar estado
  clearError: () => set({ error: null }),
  reset: () => set({ orders: [], loading: false, error: null })
}));

export default useOrderStore;
