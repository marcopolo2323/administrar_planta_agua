import { create } from 'zustand';
import axios from '../utils/axios';

const useProductStore = create((set, get) => ({
  // Estado
  products: [],
  loading: false,
  error: null,

  // Acciones
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/products');
      set({ products: response.data, loading: false });
    } catch (error) {
      console.error('Error al cargar productos:', error);
      set({ error: error.message, loading: false });
    }
  },

  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/products', productData);
      const newProduct = response.data;
      
      set(state => ({
        products: [...state.products, newProduct],
        loading: false
      }));
      
      return { success: true, data: newProduct };
    } catch (error) {
      console.error('Error al crear producto:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (productId, productData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/products/${productId}`, productData);
      const updatedProduct = response.data;
      
      set(state => ({
        products: state.products.map(product => 
          product.id === productId ? updatedProduct : product
        ),
        loading: false
      }));
      
      return { success: true, data: updatedProduct };
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/products/${productId}`);
      
      set(state => ({
        products: state.products.filter(product => product.id !== productId),
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Calcular precio con descuentos
  calculatePrice: async (productId, quantity) => {
    try {
      const response = await axios.post(`/api/products/${productId}/calculate-price`, { quantity });
      return { success: true, data: response.data.data.pricing };
    } catch (error) {
      console.error('Error al calcular precio:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener información de precios
  getPricingInfo: async (productId) => {
    try {
      const response = await axios.get(`/api/products/${productId}/pricing-info`);
      return { success: true, data: response.data.data.pricingInfo };
    } catch (error) {
      console.error('Error al obtener información de precios:', error);
      return { success: false, error: error.message };
    }
  },

  // Filtros y búsqueda
  getFilteredProducts: (searchTerm) => {
    const { products } = get();
    
    return products.filter(product => {
      const name = product.name.toLowerCase();
      const description = product.description ? product.description.toLowerCase() : '';
      const type = product.type ? product.type.toLowerCase() : '';
      
      return name.includes(searchTerm.toLowerCase()) ||
             description.includes(searchTerm.toLowerCase()) ||
             type.includes(searchTerm.toLowerCase());
    });
  },

  // Obtener producto por ID
  getProductById: (productId) => {
    const { products } = get();
    return products.find(product => product.id === productId);
  },

  // Limpiar estado
  clearError: () => set({ error: null }),
  reset: () => set({ products: [], loading: false, error: null })
}));

export default useProductStore;