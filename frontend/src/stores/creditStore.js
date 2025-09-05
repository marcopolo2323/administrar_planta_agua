import { create } from 'zustand';
import axios from '../utils/axios';

const useCreditStore = create((set, get) => ({
  // Estado
  credits: [],
  clients: [],
  loading: false,
  error: null,

  // Acciones
  fetchCredits: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/credits');
      set({ credits: response.data, loading: false });
    } catch (error) {
      console.error('Error al cargar créditos:', error);
      set({ error: error.message, loading: false });
    }
  },

  fetchClients: async () => {
    try {
      const response = await axios.get('/api/clients');
      set({ clients: response.data });
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      set({ error: error.message });
    }
  },

  createCredit: async (creditData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/credits', creditData);
      const newCredit = response.data;
      
      set(state => ({
        credits: [...state.credits, newCredit],
        loading: false
      }));
      
      return { success: true, data: newCredit };
    } catch (error) {
      console.error('Error al crear crédito:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  updateCredit: async (creditId, creditData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/credits/${creditId}`, creditData);
      const updatedCredit = response.data;
      
      set(state => ({
        credits: state.credits.map(credit => 
          credit.id === creditId ? updatedCredit : credit
        ),
        loading: false
      }));
      
      return { success: true, data: updatedCredit };
    } catch (error) {
      console.error('Error al actualizar crédito:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  deleteCredit: async (creditId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/credits/${creditId}`);
      
      set(state => ({
        credits: state.credits.filter(credit => credit.id !== creditId),
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar crédito:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Filtros y búsqueda
  getFilteredCredits: (searchTerm) => {
    const { credits, clients } = get();
    
    return credits.filter(credit => {
      const client = clients.find(c => c.id === credit.clientId);
      const clientName = client ? client.name.toLowerCase() : '';
      return clientName.includes(searchTerm.toLowerCase()) ||
             credit.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
  },

  // Limpiar estado
  clearError: () => set({ error: null }),
  reset: () => set({ credits: [], clients: [], loading: false, error: null })
}));

export default useCreditStore;