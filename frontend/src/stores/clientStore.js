import { create } from 'zustand';
import axios from '../utils/axios';

export const useClientStore = create((set, get) => ({
  // Estado
  clients: [],
  client: null,
  loading: false,
  error: null,

  // Acciones
  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/clients');
      set({ clients: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar clientes',
        loading: false
      });
    }
  },

  fetchClientById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/clients/${id}`);
      set({ client: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar el cliente',
        loading: false
      });
      return null;
    }
  },

  searchClients: async (query) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/clients/search?q=${query}`);
      set({ clients: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al buscar clientes',
        loading: false
      });
      return [];
    }
  },

  createClient: async (clientData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/clients', clientData);
      set({
        clients: [...get().clients, response.data],
        loading: false
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al crear el cliente',
        loading: false
      });
      return null;
    }
  },

  updateClient: async (id, clientData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/clients/${id}`, clientData);
      set({
        clients: get().clients.map(client => 
          client.id === id ? response.data : client
        ),
        client: response.data,
        loading: false
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al actualizar el cliente',
        loading: false
      });
      return null;
    }
  },

  deleteClient: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/clients/${id}`);
      set({
        clients: get().clients.filter(client => client.id !== id),
        loading: false
      });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al eliminar el cliente',
        loading: false
      });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));