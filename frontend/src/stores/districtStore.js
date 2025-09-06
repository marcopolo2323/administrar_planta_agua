import { create } from 'zustand';
import axios from '../utils/axios';

const useDistrictStore = create((set, get) => ({
  // Estado
  districts: [],
  loading: false,
  error: null,

  // Acciones
  fetchDistricts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/districts');
      const data = response.data.success ? response.data.data : response.data;
      set({ 
        districts: data, 
        loading: false 
      });
      return { success: true, data: data };
    } catch (error) {
      console.error('Error al cargar distritos:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar distritos',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Error al cargar distritos' };
    }
  },

  getDistrictById: (districtId) => {
    const { districts } = get();
    return Array.isArray(districts) ? districts.find(district => district.id === districtId) : null;
  },

  getDistrictsByFee: (maxFee) => {
    const { districts } = get();
    return Array.isArray(districts) ? districts.filter(district => district.deliveryFee <= maxFee) : [];
  },

  clearError: () => set({ error: null })
}));

export default useDistrictStore;
