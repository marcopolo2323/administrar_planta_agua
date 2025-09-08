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

  updateDistrict: async (districtId, districtData) => {
    try {
      const response = await axios.put(`/api/districts/${districtId}`, districtData);
      const updatedDistrict = response.data.data || response.data;
      set(state => ({
        districts: Array.isArray(state.districts) ? state.districts.map(district => 
          district.id === districtId ? updatedDistrict : district
        ) : []
      }));
      return { success: true, data: updatedDistrict };
    } catch (error) {
      console.error('Error al actualizar distrito:', error);
      set({ error: error.response?.data?.message || 'Error al actualizar distrito' });
      return { success: false, error: error.response?.data?.message || 'Error al actualizar distrito' };
    }
  },

  createDistrict: async (districtData) => {
    try {
      console.log('🔄 Creando distrito con datos:', districtData);
      const response = await axios.post('/api/districts', districtData);
      console.log('📦 Respuesta del backend:', response.data);
      const newDistrict = response.data.data || response.data;
      console.log('📦 Distrito procesado:', newDistrict);
      set(state => {
        const updatedDistricts = [...(Array.isArray(state.districts) ? state.districts : []), newDistrict];
        console.log('📦 Distritos actualizados en store:', updatedDistricts);
        return { districts: updatedDistricts };
      });
      return { success: true, data: newDistrict };
    } catch (error) {
      console.error('❌ Error al crear distrito:', error);
      set({ error: error.response?.data?.message || 'Error al crear distrito' });
      return { success: false, error: error.response?.data?.message || 'Error al crear distrito' };
    }
  },

  clearError: () => set({ error: null })
}));

export default useDistrictStore;
