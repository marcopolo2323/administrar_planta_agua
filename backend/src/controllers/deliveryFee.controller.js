const { DeliveryFee } = require('../models');

// Obtener todas las tarifas de envío
exports.getDeliveryFees = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const whereClause = {};
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const deliveryFees = await DeliveryFee.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: deliveryFees
    });
  } catch (error) {
    console.error('Error al obtener tarifas de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener una tarifa específica
exports.getDeliveryFeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryFee = await DeliveryFee.findByPk(id);

    if (!deliveryFee) {
      return res.status(404).json({
        success: false,
        message: 'Tarifa de envío no encontrada'
      });
    }

    res.json({
      success: true,
      data: deliveryFee
    });
  } catch (error) {
    console.error('Error al obtener tarifa de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nueva tarifa de envío
exports.createDeliveryFee = async (req, res) => {
  try {
    const {
      name,
      description,
      basePrice,
      pricePerKm,
      minOrderAmount,
      maxDistance,
      isActive = true
    } = req.body;

    // Validaciones
    if (!name || basePrice === undefined || pricePerKm === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, precio base y precio por km son requeridos'
      });
    }

    if (basePrice < 0 || pricePerKm < 0) {
      return res.status(400).json({
        success: false,
        message: 'Los precios no pueden ser negativos'
      });
    }

    const deliveryFee = await DeliveryFee.create({
      name,
      description,
      basePrice,
      pricePerKm,
      minOrderAmount: minOrderAmount || 0,
      maxDistance: maxDistance || 0,
      isActive
    });

    res.status(201).json({
      success: true,
      message: 'Tarifa de envío creada correctamente',
      data: deliveryFee
    });
  } catch (error) {
    console.error('Error al crear tarifa de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar tarifa de envío
exports.updateDeliveryFee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const deliveryFee = await DeliveryFee.findByPk(id);
    if (!deliveryFee) {
      return res.status(404).json({
        success: false,
        message: 'Tarifa de envío no encontrada'
      });
    }

    // Validaciones
    if (updateData.basePrice !== undefined && updateData.basePrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio base no puede ser negativo'
      });
    }

    if (updateData.pricePerKm !== undefined && updateData.pricePerKm < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio por km no puede ser negativo'
      });
    }

    await deliveryFee.update(updateData);

    res.json({
      success: true,
      message: 'Tarifa de envío actualizada correctamente',
      data: deliveryFee
    });
  } catch (error) {
    console.error('Error al actualizar tarifa de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar tarifa de envío
exports.deleteDeliveryFee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryFee = await DeliveryFee.findByPk(id);
    if (!deliveryFee) {
      return res.status(404).json({
        success: false,
        message: 'Tarifa de envío no encontrada'
      });
    }

    await deliveryFee.destroy();

    res.json({
      success: true,
      message: 'Tarifa de envío eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar tarifa de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Calcular costo de envío
exports.calculateDeliveryCost = async (req, res) => {
  try {
    const { distance, orderAmount } = req.body;

    if (distance === undefined || orderAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Distancia y monto del pedido son requeridos'
      });
    }

    // Buscar tarifa aplicable
    const deliveryFee = await DeliveryFee.findOne({
      where: {
        isActive: true,
        minOrderAmount: {
          [Op.lte]: orderAmount
        },
        maxDistance: {
          [Op.gte]: distance
        }
      },
      order: [['basePrice', 'ASC']] // Preferir la más barata
    });

    if (!deliveryFee) {
      return res.status(404).json({
        success: false,
        message: 'No hay tarifa de envío disponible para esta distancia y monto'
      });
    }

    const totalCost = parseFloat(deliveryFee.basePrice) + (parseFloat(deliveryFee.pricePerKm) * distance);

    res.json({
      success: true,
      data: {
        deliveryFee: deliveryFee.name,
        basePrice: deliveryFee.basePrice,
        pricePerKm: deliveryFee.pricePerKm,
        distance,
        totalCost: Math.round(totalCost * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error al calcular costo de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};