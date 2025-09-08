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
      price
    } = req.body;

    // Validaciones
    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y precio son requeridos'
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio no puede ser negativo'
      });
    }

    const deliveryFee = await DeliveryFee.create({
      name,
      description: `Flete para ${name}`,
      basePrice: price,
      pricePerKm: 0,
      minOrderAmount: 0,
      maxDistance: 0,
      isActive: true
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
    const { name, price } = req.body;

    const deliveryFee = await DeliveryFee.findByPk(id);
    if (!deliveryFee) {
      return res.status(404).json({
        success: false,
        message: 'Tarifa de envío no encontrada'
      });
    }

    // Validaciones
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio no puede ser negativo'
      });
    }

    const updateData = {
      name: name || deliveryFee.name,
      basePrice: price !== undefined ? price : deliveryFee.basePrice,
      description: `Flete para ${name || deliveryFee.name}`
    };

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