import axios from 'axios';

// Configuración base de axios
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a las solicitudes
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      // Asegurarse de que el token esté correctamente formateado
      console.log('Token enviado:', `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en la respuesta:', error);
    
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      console.log('Error de autenticación, redirigiendo al login');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    
    // Manejar errores de autorización (403)
    if (error.response && error.response.status === 403) {
      console.log('Error de autorización:', error.response.data);
    }
    
    // Manejar errores de servidor (500)
    if (error.response && error.response.status === 500) {
      console.error('Error del servidor:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default instance;