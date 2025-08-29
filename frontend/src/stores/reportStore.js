import { create } from 'zustand';
import axios from '../utils/axios';

export const useReportStore = create((set, get) => ({
  // Estado
  periodReport: null,
  clientReport: null,
  productReport: null,
  districtReport: null,
  loading: false,
  error: null,

  // Acciones
  fetchSalesByPeriod: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/reports/sales-by-period?startDate=${startDate}&endDate=${endDate}`);
      set({ periodReport: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar reporte por período',
        loading: false
      });
      return null;
    }
  },

  fetchSalesByClient: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/reports/sales-by-client?startDate=${startDate}&endDate=${endDate}`);
      set({ clientReport: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar reporte por cliente',
        loading: false
      });
      return null;
    }
  },

  fetchSalesByProduct: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/reports/sales-by-product?startDate=${startDate}&endDate=${endDate}`);
      set({ productReport: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar reporte por producto',
        loading: false
      });
      return null;
    }
  },

  fetchSalesByDistrict: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/reports/sales-by-district?startDate=${startDate}&endDate=${endDate}`);
      set({ districtReport: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar reporte por distrito',
        loading: false
      });
      return null;
    }
  },

  clearReports: () => {
    set({
      periodReport: null,
      clientReport: null,
      productReport: null,
      districtReport: null
    });
  },

  clearError: () => set({ error: null })
}));