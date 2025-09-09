import { create } from 'zustand';
import axios from '../utils/axios';

const useSaleStore = create((set, get) => ({
  // Estado
  sales: [],
  loading: false,
  error: null,
  timeFilter: 'today', // 'today', 'weekly', 'monthly'
  todayStats: {
    totalOrders: 0,
    totalAmount: 0,
    deliveredAmount: 0,
    pendingAmount: 0,
    totalBidones: 0,
    totalPaquetes: 0,
    productStats: {}
  },
  weeklyStats: {
    totalOrders: 0,
    totalAmount: 0,
    deliveredAmount: 0,
    pendingAmount: 0,
    totalBidones: 0,
    totalPaquetes: 0,
    productStats: {},
    dailyStats: []
  },
  monthlyStats: {
    totalOrders: 0,
    totalAmount: 0,
    deliveredAmount: 0,
    pendingAmount: 0,
    totalBidones: 0,
    totalPaquetes: 0,
    productStats: {},
    weeklyStats: []
  },

  // Acciones
  fetchSales: async (timeFilter = 'today') => {
    set({ loading: true, error: null, timeFilter });
    try {
      let endpoint = '/api/sales/today';
      if (timeFilter === 'weekly') {
        endpoint = '/api/sales/weekly';
      } else if (timeFilter === 'monthly') {
        endpoint = '/api/sales/monthly';
      }
      
      const response = await axios.get(endpoint);
      if (response.data.success) {
        const statsKey = timeFilter === 'today' ? 'todayStats' : 
                        timeFilter === 'weekly' ? 'weeklyStats' : 'monthlyStats';
        
        set({ 
          sales: response.data.data, 
          loading: false,
          [statsKey]: response.data.stats
        });
      } else {
        set({ sales: [], loading: false });
      }
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
    const { timeFilter, todayStats, weeklyStats, monthlyStats } = get();
    
    const currentStats = timeFilter === 'today' ? todayStats : 
                        timeFilter === 'weekly' ? weeklyStats : monthlyStats;
    
    return {
      totalOrders: currentStats.totalOrders,
      totalAmount: currentStats.totalAmount,
      deliveredAmount: currentStats.deliveredAmount,
      pendingAmount: currentStats.pendingAmount,
      totalBidones: currentStats.totalBidones,
      totalPaquetes: currentStats.totalPaquetes,
      productStats: currentStats.productStats,
      dailyStats: currentStats.dailyStats || [],
      weeklyStats: currentStats.weeklyStats || []
    };
  },

  // Limpiar estado
  clearError: () => set({ error: null }),
  reset: () => set({ sales: [], loading: false, error: null })
}));

export default useSaleStore;