import axios from 'axios';

// Configuración base de axios
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://aquayara.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Interceptor para agregar el token a las solicitudes
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🌐 URL completa:', config.baseURL + config.url);
    console.log('🌐 BaseURL configurado:', config.baseURL);
    console.log('🌐 URL relativa:', config.url);
    console.log('🔑 Token presente:', token ? 'Sí' : 'No');
    console.log('🔑 Token completo:', token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token enviado para:', config.url);
      console.log('🔑 Header configurado:', config.headers['Authorization']);
    } else {
      console.log('❌ No hay token disponible');
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

// Variable para evitar múltiples intentos de renovación
let isRefreshing = false;
let failedQueue = [];

// Función para procesar la cola de solicitudes fallidas
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor para manejar errores de respuesta
instance.interceptors.response.use(
  (response) => {
    console.log('📦 Respuesta recibida de:', response.config.url);
    console.log('📦 Status:', response.status);
    console.log('📦 Content-Type:', response.headers['content-type']);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Solo intentar renovar token si hay un token en localStorage y es un error 401
    const token = localStorage.getItem('token');
    if (error.response && error.response.status === 401 && !originalRequest._retry && token && !originalRequest.url?.includes('/auth/profile')) {
      if (isRefreshing) {
        // Si ya estamos renovando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return instance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Intentando renovar token...');
        // Intentar renovar el token
        const response = await instance.post('/api/auth/refresh');
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        instance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        
        console.log('✅ Token renovado exitosamente');
        processQueue(null, token);
        
        // Reintentar la solicitud original
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        return instance(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Error al renovar token:', refreshError);
        processQueue(refreshError, null);
        
        // Solo cerrar sesión si es un error de autenticación (401) o autorización (403)
        if (refreshError.response && (refreshError.response.status === 401 || refreshError.response.status === 403)) {
          console.log('🚪 Cerrando sesión por fallo en renovación');
          localStorage.removeItem('token');
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Para otros errores, solo logear
    if (error.response && error.response.status === 403) {
      console.log('Error de autorización:', error.response.data);
    } else if (error.response && error.response.status === 404) {
      console.log('Recurso no encontrado:', error.response.data);
    } else if (error.response && error.response.status === 500) {
      console.error('Error del servidor:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default instance;