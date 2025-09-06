import { create } from 'zustand';
import axios from '../utils/axios';

const useReportStore = create((set, get) => ({
  // Estado
  reportData: null,
  loading: false,
  error: null,

  // Acciones
  generateReport: async (reportType, startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/reports', {
        params: {
          type: reportType,
          startDate,
          endDate
        }
      });
      set({ 
        reportData: response.data, 
        loading: false 
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error al generar reporte:', error);
      set({ 
        error: error.response?.data?.message || 'Error al generar reporte',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Error al generar reporte' };
    }
  },

  exportReport: (reportType, startDate, endDate) => {
    const { reportData } = get();
    if (!reportData) return;

    // Crear CSV simple
    const csvContent = get().generateCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${reportType}_${startDate}_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  generateCSV: (data) => {
    if (!data) return '';
    
    let csv = 'Fecha,Descripción,Monto,Estado\n';
    if (data.details) {
      data.details.forEach(item => {
        csv += `${item.date},${item.description},${item.amount},${item.status}\n`;
      });
    }
    return csv;
  },

  clearError: () => set({ error: null }),
  clearReport: () => set({ reportData: null })
}));

export default useReportStore;