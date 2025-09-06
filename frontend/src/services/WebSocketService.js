import { toast } from 'react-toastify';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (!token) {
      console.error('No se puede conectar al WebSocket: Token no proporcionado');
      return false;
    }

    // En modo desarrollo, intentar conectar WebSocket para testing
    if (import.meta.env.MODE === 'development') {
      console.log('Conectando WebSocket en modo desarrollo...');
    }

    try {
      // Determinar la URL del WebSocket (ws o wss según el protocolo actual)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Usar la URL base del API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Extraer el host correctamente
      let host;
      try {
        host = new URL(apiUrl).host;
      } catch (urlError) {
        // Si hay un error al parsear la URL, usar un valor predeterminado
        console.warn('Error al parsear la URL del API, usando valor predeterminado:', urlError);
        host = 'localhost:5000';
      }
      
      const wsUrl = `${protocol}//${host}?token=${token}`;
      console.log('Intentando conectar WebSocket a:', wsUrl);

      // Cerrar cualquier conexión existente antes de crear una nueva
      if (this.socket) {
        this.socket.close(1000, 'Cerrando conexión anterior');
      }

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('Conexión WebSocket establecida');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            // Notificar a todos los listeners registrados
            this.notifyListeners(data.data);
            
            // Mostrar toast para notificación
            this.showNotificationToast(data.data);
          }
        } catch (error) {
          console.error('Error al procesar mensaje WebSocket:', error);
        }
      };

      this.socket.onclose = (event) => {
        this.isConnected = false;
        console.log(`Conexión WebSocket cerrada: ${event.code} ${event.reason}`);
        
        // Intentar reconectar si no fue un cierre intencional y no estamos en modo de desarrollo
        if (event.code !== 1000 && import.meta.env.MODE !== 'development') {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('Error en la conexión WebSocket:', error);
        this.isConnected = false;
        
        // En modo desarrollo, intentar reconectar después de un delay
        if (import.meta.env.MODE === 'development') {
          console.log('Error de WebSocket en desarrollo, intentando reconectar en 5 segundos...');
          setTimeout(() => {
            if (this.reconnectAttempts < 3) {
              this.reconnectAttempts++;
              this.connect(token);
            } else {
              console.log('WebSocket desactivado después de múltiples intentos de reconexión');
            }
          }, 5000);
          return;
        }
      };

      return true;
    } catch (error) {
      console.error('Error al inicializar WebSocket:', error);
      return false;
    }
  }

  disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.close(1000, 'Cierre intencional');
      this.isConnected = false;
      
      // Limpiar timeout de reconexión si existe
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      
      console.log('Desconectado del WebSocket');
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Intentando reconectar en ${delay/1000} segundos...`);
      
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Intento de reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        // Obtener token actualizado del localStorage
        const token = localStorage.getItem('token');
        if (token) {
          this.connect(token);
        } else {
          console.error('No se puede reconectar: Token no disponible');
        }
      }, delay);
    } else {
      console.error(`Se alcanzó el máximo de intentos de reconexión (${this.maxReconnectAttempts})`);
    }
  }

  // Registrar un listener para notificaciones
  addNotificationListener(id, callback) {
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id); // Devuelve función para eliminar el listener
  }

  // Notificar a todos los listeners registrados
  notifyListeners(notification) {
    this.listeners.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error en listener de notificación:', error);
      }
    });
  }

  // Mostrar toast para la notificación
  showNotificationToast(notification) {
    const { title, type } = notification;
    
    let toastType = 'info';
    if (type === 'order_status') toastType = 'success';
    if (type === 'payment_status') toastType = 'info';
    if (type === 'delivery_assigned') toastType = 'success';
    if (type === 'new_order') toastType = 'warning';
    
    toast[toastType](title, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }
}

// Crear una instancia singleton
const webSocketService = new WebSocketService();
export default webSocketService;