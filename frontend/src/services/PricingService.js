import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PricingService = {
  /**
   * Calcula el precio de un producto según la cantidad
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad solicitada
   * @returns {Promise} Promise con el cálculo de precios
   */
  calculatePrice: async (productId, quantity) => {
    try {
      const response = await axios.post(`${apiUrl}/api/products/${productId}/calculate-price`, {
        quantity: quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error al calcular precio:', error);
      throw error;
    }
  },

  /**
   * Obtiene información de precios de mayoreo de un producto
   * @param {number} productId - ID del producto
   * @returns {Promise} Promise con la información de precios
   */
  getPricingInfo: async (productId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/products/${productId}/pricing-info`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener información de precios:', error);
      throw error;
    }
  },

  /**
   * Calcula el precio localmente (fallback)
   * @param {Object} product - Producto con precios
   * @param {number} quantity - Cantidad solicitada
   * @returns {Object} Cálculo de precios
   */
  calculatePriceLocal: (product, quantity) => {
    const {
      unitPrice,
      wholesalePrice,
      wholesaleMinQuantity,
      wholesalePrice2,
      wholesaleMinQuantity2,
      wholesalePrice3,
      wholesaleMinQuantity3
    } = product;

    let finalPrice = unitPrice;
    let discountApplied = null;
    let priceLevel = 'normal';

    // Verificar tercer nivel de mayoreo (si existe)
    if (wholesalePrice3 && wholesaleMinQuantity3 && quantity >= wholesaleMinQuantity3) {
      finalPrice = wholesalePrice3;
      discountApplied = unitPrice - wholesalePrice3;
      priceLevel = 'mayoreo3';
    }
    // Verificar segundo nivel de mayoreo (si existe)
    else if (wholesalePrice2 && wholesaleMinQuantity2 && quantity >= wholesaleMinQuantity2) {
      finalPrice = wholesalePrice2;
      discountApplied = unitPrice - wholesalePrice2;
      priceLevel = 'mayoreo2';
    }
    // Verificar primer nivel de mayoreo
    else if (wholesalePrice && wholesaleMinQuantity && quantity >= wholesaleMinQuantity) {
      finalPrice = wholesalePrice;
      discountApplied = unitPrice - wholesalePrice;
      priceLevel = 'mayoreo1';
    }

    return {
      unitPrice: finalPrice,
      totalPrice: finalPrice * quantity,
      originalPrice: unitPrice,
      discountApplied: discountApplied,
      priceLevel: priceLevel,
      savings: discountApplied ? discountApplied * quantity : 0
    };
  }
};

export default PricingService;
