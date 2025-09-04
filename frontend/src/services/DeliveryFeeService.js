import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DeliveryFeeService = {
  /**
   * Obtiene todos los costos de envío por distrito
   * @returns {Promise} Promise con los datos de costos de envío
   */
  getAllDeliveryFees: async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/delivery-fees`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener costos de envío:', error);
      throw error;
    }
  },

  /**
   * Obtiene el costo de envío para un distrito específico
   * @param {string} district - Nombre del distrito
   * @returns {Promise} Promise con los datos del costo de envío
   */
  getDeliveryFeeByDistrict: async (district) => {
    try {
      const response = await axios.get(`${apiUrl}/api/delivery-fees/district/${district}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener costo de envío para ${district}:`, error);
      throw error;
    }
  }
};

export default DeliveryFeeService;