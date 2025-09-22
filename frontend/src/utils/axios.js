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
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
instance.interceptors.response.use(
  (response) => {
    console.log('📦 Respuesta recibida de:', response.config.url);
    console.log('📦 Status:', response.status);
    console.log('📦 Content-Type:', response.headers['content-type']);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const token = localStorage.getItem('token');
    
    console.log('❌ Error en respuesta:', error.response?.status, error.config?.url);
    
    // Si el error es 401 y hay un token, intentar renovarlo
    if (error.response && error.response.status === 401 && !originalRequest._retry && token && !originalRequest.url?.includes('/auth/profile')) {
      console.log('🔄 Token expirado, se reintentará automáticamente');
      originalRequest._retry = true;
      
      try {
        // Intentar renovar el token
        const refreshResponse = await axios.post(`${import.meta.env.VITE_API_URL || 'https://aquayara.onrender.com'}/api/auth/refresh`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (refreshResponse.data.success) {
          const newToken = refreshResponse.data.token;
          localStorage.setItem('token', newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          console.log('✅ Token renovado exitosamente');
          return instance(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Error al renovar token:', refreshError);
        // Si falla la renovación, redirigir al login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Si es un error 404, mostrar mensaje más claro
    if (error.response && error.response.status === 404) {
      console.log('Recurso no encontrado:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default instance;