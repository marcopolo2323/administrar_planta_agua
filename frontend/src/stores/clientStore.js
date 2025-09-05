import { create } from 'zustand';
import axios from '../utils/axios';

const useClientStore = create((set, get) => ({
  // Estado
  clients: [],
  loading: false,
  error: null,

  // Acciones
  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/clients');
      set({ clients: response.data, loading: false });
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      set({ error: error.message, loading: false });
    }
  },

  createClient: async (clientData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/clients', clientData);
      const newClient = response.data;
      
      set(state => ({
        clients: [...state.clients, newClient],
        loading: false
      }));
      
      return { success: true, data: newClient };
    } catch (error) {
      console.error('Error al crear cliente:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  updateClient: async (clientId, clientData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/clients/${clientId}`, clientData);
      const updatedClient = response.data;
      
      set(state => ({
        clients: state.clients.map(client => 
          client.id === clientId ? updatedClient : client
        ),
        loading: false
      }));
      
      return { success: true, data: updatedClient };
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  deleteClient: async (clientId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/clients/${clientId}`);
      
      set(state => ({
        clients: state.clients.filter(client => client.id !== clientId),
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Filtros y búsqueda
  getFilteredClients: (searchTerm) => {
    const { clients } = get();
    
    return clients.filter(client => {
      const name = client.name.toLowerCase();
      const document = client.documentNumber.toLowerCase();
      const email = client.email ? client.email.toLowerCase() : '';
      
      return name.includes(searchTerm.toLowerCase()) ||
             document.includes(searchTerm.toLowerCase()) ||
             email.includes(searchTerm.toLowerCase());
    });
  },

  // Obtener cliente por ID
  getClientById: (clientId) => {
    const { clients } = get();
    return clients.find(client => client.id === clientId);
  },

  // Limpiar estado
  clearError: () => set({ error: null }),
  reset: () => set({ clients: [], loading: false, error: null })
}));

export default useClientStore;