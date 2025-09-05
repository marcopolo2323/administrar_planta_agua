import { create } from 'zustand';
import axios from '../utils/axios';

const useSaleStore = create((set, get) => ({
  // Estado
  sales: [],
  loading: false,
  error: null,

  // Acciones
  fetchSales: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/sales');
      set({ sales: response.data, loading: false });
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      set({ error: error.message, loading: false });
    }
  },

  createSale: async (saleData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/sales', saleData);
      const newSale = response.data;
      
      set(state => ({
        sales: [...state.sales, newSale],
        loading: false
      }));
      
      return { success: true, data: newSale };
    } catch (error) {
      console.error('Error al crear venta:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  updateSale: async (saleId, saleData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/sales/${saleId}`, saleData);
      const updatedSale = response.data;
      
      set(state => ({
        sales: state.sales.map(sale => 
          sale.id === saleId ? updatedSale : sale
        ),
        loading: false
      }));
      
      return { success: true, data: updatedSale };
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  deleteSale: async (saleId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/sales/${saleId}`);
      
      set(state => ({
        sales: state.sales.filter(sale => sale.id !== saleId),
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Filtros y búsqueda
  getFilteredSales: (searchTerm) => {
    const { sales } = get();
    
    return sales.filter(sale => {
      const invoiceNumber = sale.invoiceNumber ? sale.invoiceNumber.toLowerCase() : '';
      const notes = sale.notes ? sale.notes.toLowerCase() : '';
      
      return invoiceNumber.includes(searchTerm.toLowerCase()) ||
             notes.includes(searchTerm.toLowerCase());
    });
  },

  // Obtener venta por ID
  getSaleById: (saleId) => {
    const { sales } = get();
    return sales.find(sale => sale.id === saleId);
  },

  // Estadísticas
  getSalesStats: () => {
    const { sales } = get();
    
    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const today = new Date();
      return saleDate.toDateString() === today.toDateString();
    });
    
    return {
      totalSales,
      totalAmount,
      todaySales: todaySales.length,
      todayAmount: todaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0)
    };
  },

  // Limpiar estado
  clearError: () => set({ error: null }),
  reset: () => set({ sales: [], loading: false, error: null })
}));

export default useSaleStore;