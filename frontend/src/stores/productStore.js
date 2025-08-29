import { create } from 'zustand';
import axios from '../utils/axios';

export const useProductStore = create((set, get) => ({
  // Estado
  products: [],
  product: null,
  loading: false,
  error: null,

  // Acciones
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/products');
      set({ products: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar productos',
        loading: false
      });
    }
  },

  fetchProductById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/products/${id}`);
      set({ product: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar el producto',
        loading: false
      });
      return null;
    }
  },

  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/products', productData);
      set({
        products: [...get().products, response.data],
        loading: false
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al crear el producto',
        loading: false
      });
      return null;
    }
  },

  updateProduct: async (id, productData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/products/${id}`, productData);
      set({
        products: get().products.map(product => 
          product.id === id ? response.data : product
        ),
        product: response.data,
        loading: false
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al actualizar el producto',
        loading: false
      });
      return null;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/products/${id}`);
      set({
        products: get().products.filter(product => product.id !== id),
        loading: false
      });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al eliminar el producto',
        loading: false
      });
      return false;
    }
  },

  updateStock: async (id, quantity) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(`/api/products/${id}/stock`, { quantity });
      set({
        products: get().products.map(product => 
          product.id === id ? { ...product, stock: response.data.stock } : product
        ),
        loading: false
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al actualizar el stock',
        loading: false
      });
      return null;
    }
  },

  clearError: () => set({ error: null })
}));