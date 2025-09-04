import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { FaBell, FaCheck, FaCheckDouble, FaTimes } from 'react-icons/fa';
import webSocketService from '../services/WebSocketService';
import '../styles/NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      // Axios ya tiene configurado el interceptor para agregar el token
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notif => !notif.read).length);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    }
  };

  // Función para manejar notificaciones en tiempo real
  const handleRealTimeNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Conectar al WebSocket si hay un token disponible
    if (token) {
      webSocketService.connect(token);
      
      // Registrar listener para notificaciones en tiempo real
      const removeListener = webSocketService.addNotificationListener(
        'notificationCenter', 
        handleRealTimeNotification
      );
      
      return () => {
        removeListener(); // Eliminar listener al desmontar
      };
    }
  }, [token, handleRealTimeNotification]);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {});
      
      // Actualizar estado local
      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all', {});
      
      // Actualizar estado local
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      
      // Actualizar estado local
      const updatedNotifications = notifications.filter(notif => notif._id !== notificationId);
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(notif => !notif.read).length);
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Marcar como leída
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navegar según el tipo de notificación y el rol del usuario
    if (notification.type === 'new_order' && user.role === 'admin') {
      navigate('/admin/orders');
    } else if (notification.type === 'order_status' && user.role === 'client') {
      navigate(`/client/orders/${notification.orderId}`);
    } else if (notification.type === 'payment_status' && user.role === 'client') {
      navigate(`/client/orders/${notification.orderId}`);
    } else if (notification.type === 'delivery_assigned' && user.role === 'repartidor') {
      navigate(`/delivery/orders/${notification.orderId}`);
    }
    
    // Cerrar el panel de notificaciones
    setIsOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="notification-center">
      <div className="notification-icon" onClick={toggleNotifications}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notificaciones</h3>
            {notifications.length > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                <FaCheckDouble /> Marcar todas como leídas
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No hay notificaciones</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div 
                    className="notification-content" 
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatDate(notification.createdAt)}</div>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        className="mark-read-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button 
                      className="delete-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;