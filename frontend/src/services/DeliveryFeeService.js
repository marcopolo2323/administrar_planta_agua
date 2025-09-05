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
  },

  /**
   * Crea un nuevo costo de envío
   * @param {Object} deliveryFeeData - Datos del costo de envío
   * @returns {Promise} Promise con los datos del costo de envío creado
   */
  createDeliveryFee: async (deliveryFeeData) => {
    try {
      const response = await axios.post(`${apiUrl}/api/delivery-fees`, deliveryFeeData);
      return response.data;
    } catch (error) {
      console.error('Error al crear costo de envío:', error);
      throw error;
    }
  },

  /**
   * Actualiza un costo de envío existente
   * @param {number} id - ID del costo de envío
   * @param {Object} deliveryFeeData - Datos actualizados del costo de envío
   * @returns {Promise} Promise con los datos del costo de envío actualizado
   */
  updateDeliveryFee: async (id, deliveryFeeData) => {
    try {
      const response = await axios.put(`${apiUrl}/api/delivery-fees/${id}`, deliveryFeeData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar costo de envío ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina un costo de envío
   * @param {number} id - ID del costo de envío
   * @returns {Promise} Promise con la respuesta de eliminación
   */
  deleteDeliveryFee: async (id) => {
    try {
      const response = await axios.delete(`${apiUrl}/api/delivery-fees/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar costo de envío ${id}:`, error);
      throw error;
    }
  }
};

export default DeliveryFeeService;