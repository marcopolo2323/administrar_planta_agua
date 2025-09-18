/**
 * Calcula el precio correcto de un producto según la cantidad solicitada
 * @param {Object} product - Producto con precios de mayoreo
 * @param {number} quantity - Cantidad solicitada
 * @returns {Object} - Objeto con precio unitario y descuento aplicado
 */
function calculateProductPrice(product, quantity) {
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

  // Descuento especial para Paquete de Botellas de Agua (50+ unidades = S/ 9.00)
  if (product.name === 'Paquete de Botellas de Agua' && quantity >= 50) {
    finalPrice = 9.00;
    discountApplied = unitPrice - 9.00;
    priceLevel = 'especial50';
  }
  // Verificar tercer nivel de mayoreo (si existe)
  else if (wholesalePrice3 && wholesaleMinQuantity3 && quantity >= wholesaleMinQuantity3) {
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

/**
 * Obtiene información de precios de mayoreo para mostrar al cliente
 * @param {Object} product - Producto con precios de mayoreo
 * @returns {Array} - Array con información de niveles de precios
 */
function getWholesalePricingInfo(product) {
  const pricingInfo = [];
  
  // Precio normal
  pricingInfo.push({
    level: 'normal',
    minQuantity: 1,
    price: product.unitPrice,
    description: 'Precio normal'
  });

  // Primer nivel de mayoreo
  if (product.wholesalePrice && product.wholesaleMinQuantity) {
    pricingInfo.push({
      level: 'mayoreo1',
      minQuantity: product.wholesaleMinQuantity,
      price: product.wholesalePrice,
      description: `Desde ${product.wholesaleMinQuantity} unidades`
    });
  }

  // Segundo nivel de mayoreo
  if (product.wholesalePrice2 && product.wholesaleMinQuantity2) {
    pricingInfo.push({
      level: 'mayoreo2',
      minQuantity: product.wholesaleMinQuantity2,
      price: product.wholesalePrice2,
      description: `Desde ${product.wholesaleMinQuantity2} unidades`
    });
  }

  // Tercer nivel de mayoreo
  if (product.wholesalePrice3 && product.wholesaleMinQuantity3) {
    pricingInfo.push({
      level: 'mayoreo3',
      minQuantity: product.wholesaleMinQuantity3,
      price: product.wholesalePrice3,
      description: `Desde ${product.wholesaleMinQuantity3} unidades`
    });
  }

  return pricingInfo;
}

module.exports = {
  calculateProductPrice,
  getWholesalePricingInfo
};
