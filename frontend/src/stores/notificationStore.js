import { create } from 'zustand';
import axios from '../utils/axios';

const useNotificationStore = create((set, get) => ({
  // Estado
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // Acciones
  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/notifications');
      const notifications = response.data;
      const unreadCount = notifications.filter(notif => !notif.read).length;
      
      set({ 
        notifications, 
        unreadCount, 
        loading: false 
      });
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      set({ error: error.message, loading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {});
      
      set(state => {
        const updatedNotifications = state.notifications.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        );
        const unreadCount = updatedNotifications.filter(notif => !notif.read).length;
        
        return {
          notifications: updatedNotifications,
          unreadCount
        };
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  markAllAsRead: async () => {
    try {
      await axios.put('/api/notifications/mark-all-read', {});
      
      set(state => ({
        notifications: state.notifications.map(notif => ({ ...notif, read: true })),
        unreadCount: 0
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      
      set(state => {
        const updatedNotifications = state.notifications.filter(notif => notif._id !== notificationId);
        const unreadCount = updatedNotifications.filter(notif => !notif.read).length;
        
        return {
          notifications: updatedNotifications,
          unreadCount
        };
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Agregar notificación en tiempo real
  addNotification: (notification) => {
    set(state => {
      const updatedNotifications = [notification, ...state.notifications];
      const unreadCount = updatedNotifications.filter(notif => !notif.read).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount
      };
    });
  },

  // Crear notificación de prueba
  createTestNotification: async () => {
    try {
      const response = await axios.post('/api/notifications/test');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error al crear notificación de prueba:', error);
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Filtros
  getUnreadNotifications: () => {
    const { notifications } = get();
    return notifications.filter(notif => !notif.read);
  },

  getNotificationsByType: (type) => {
    const { notifications } = get();
    return notifications.filter(notif => notif.type === type);
  },

  // Limpiar estado
  clearError: () => set({ error: null }),
  reset: () => set({ 
    notifications: [], 
    unreadCount: 0, 
    loading: false, 
    error: null 
  })
}));

export default useNotificationStore;
