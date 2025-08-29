import { create } from 'zustand';
import axios from '../utils/axios';

export const useSaleStore = create((set, get) => ({
  // Estado
  sales: [],
  sale: null,
  loading: false,
  error: null,
  currentSale: {
    clientId: null,
    invoiceType: 'boleta',
    invoiceNumber: '',
    items: [],
    total: 0,
    notes: ''
  },

  // Acciones
  fetchSales: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/sales');
      set({ sales: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar ventas',
        loading: false
      });
    }
  },

  fetchSaleById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/sales/${id}`);
      set({ sale: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar la venta',
        loading: false
      });
      return null;
    }
  },

  fetchSalesByClient: async (clientId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/sales/client/${clientId}`);
      set({ sales: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar ventas del cliente',
        loading: false
      });
      return [];
    }
  },

  fetchSalesByDate: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/sales/date?startDate=${startDate}&endDate=${endDate}`);
      set({ sales: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar ventas por fecha',
        loading: false
      });
      return [];
    }
  },

  createSale: async (saleData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/sales', saleData);
      set({
        sales: [response.data, ...get().sales],
        loading: false,
        currentSale: {
          clientId: null,
          invoiceType: 'boleta',
          invoiceNumber: '',
          items: [],
          total: 0,
          notes: ''
        }
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al crear la venta',
        loading: false
      });
      return null;
    }
  },

  cancelSale: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/sales/${id}`);
      set({
        sales: get().sales.map(sale => 
          sale.id === id ? { ...sale, status: 'cancelada' } : sale
        ),
        loading: false
      });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cancelar la venta',
        loading: false
      });
      return false;
    }
  },

  // Acciones para la venta actual
  setClient: (clientId) => {
    set({
      currentSale: {
        ...get().currentSale,
        clientId
      }
    });
  },

  setInvoiceType: (invoiceType) => {
    set({
      currentSale: {
        ...get().currentSale,
        invoiceType
      }
    });
  },

  setInvoiceNumber: (invoiceNumber) => {
    set({
      currentSale: {
        ...get().currentSale,
        invoiceNumber
      }
    });
  },

  setNotes: (notes) => {
    set({
      currentSale: {
        ...get().currentSale,
        notes
      }
    });
  },

  addItem: (item) => {
    const { items } = get().currentSale;
    const existingItemIndex = items.findIndex(i => i.productId === item.productId);

    let newItems;
    if (existingItemIndex >= 0) {
      // Si el producto ya está en la lista, actualiza la cantidad y subtotal
      newItems = [...items];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + item.quantity,
        subtotal: (newItems[existingItemIndex].quantity + item.quantity) * newItems[existingItemIndex].unitPrice
      };
    } else {
      // Si es un nuevo producto, agrégalo a la lista
      newItems = [...items, { ...item, subtotal: item.quantity * item.unitPrice }];
    }

    // Calcula el nuevo total
    const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);

    set({
      currentSale: {
        ...get().currentSale,
        items: newItems,
        total
      }
    });
  },

  updateItemQuantity: (productId, quantity) => {
    const { items } = get().currentSale;
    const newItems = items.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity,
          subtotal: quantity * item.unitPrice
        };
      }
      return item;
    });

    // Calcula el nuevo total
    const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);

    set({
      currentSale: {
        ...get().currentSale,
        items: newItems,
        total
      }
    });
  },

  removeItem: (productId) => {
    const { items } = get().currentSale;
    const newItems = items.filter(item => item.productId !== productId);

    // Calcula el nuevo total
    const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);

    set({
      currentSale: {
        ...get().currentSale,
        items: newItems,
        total
      }
    });
  },

  resetCurrentSale: () => {
    set({
      currentSale: {
        clientId: null,
        invoiceType: 'boleta',
        invoiceNumber: '',
        items: [],
        total: 0,
        notes: ''
      }
    });
  },

  clearError: () => set({ error: null })
}));