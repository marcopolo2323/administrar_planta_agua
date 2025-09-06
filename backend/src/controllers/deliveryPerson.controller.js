const { DeliveryPerson, User } = require('../models');

// Obtener todos los repartidores
exports.getDeliveryPersons = async (req, res) => {
  try {
    const { status } = req.query;
    
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const deliveryPersons = await DeliveryPerson.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: deliveryPersons
    });
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener un repartidor específico
exports.getDeliveryPersonById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryPerson = await DeliveryPerson.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: 'Repartidor no encontrado'
      });
    }

    res.json({
      success: true,
      data: deliveryPerson
    });
  } catch (error) {
    console.error('Error al obtener repartidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nuevo repartidor
exports.createDeliveryPerson = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      vehicleType,
      vehiclePlate,
      licenseNumber,
      address,
      status = 'available',
      notes
    } = req.body;

    // Validaciones
    if (!name || !phone || !vehicleType || !vehiclePlate) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, teléfono, tipo de vehículo y placa son requeridos'
      });
    }

    // Verificar si ya existe un repartidor con la misma placa
    const existingPerson = await DeliveryPerson.findOne({
      where: { vehiclePlate }
    });

    if (existingPerson) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un repartidor con esta placa'
      });
    }

    const deliveryPerson = await DeliveryPerson.create({
      name,
      phone,
      email,
      vehicleType,
      vehiclePlate,
      licenseNumber,
      address,
      status,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Repartidor creado correctamente',
      data: deliveryPerson
    });
  } catch (error) {
    console.error('Error al crear repartidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar repartidor
exports.updateDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const deliveryPerson = await DeliveryPerson.findByPk(id);
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: 'Repartidor no encontrado'
      });
    }

    // Si se está actualizando la placa, verificar que no esté en uso
    if (updateData.vehiclePlate && updateData.vehiclePlate !== deliveryPerson.vehiclePlate) {
      const existingPerson = await DeliveryPerson.findOne({
        where: { 
          vehiclePlate: updateData.vehiclePlate,
          id: { [Op.ne]: id }
        }
      });

      if (existingPerson) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un repartidor con esta placa'
        });
      }
    }

    await deliveryPerson.update(updateData);

    res.json({
      success: true,
      message: 'Repartidor actualizado correctamente',
      data: deliveryPerson
    });
  } catch (error) {
    console.error('Error al actualizar repartidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar estado del repartidor
exports.updateDeliveryPersonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['available', 'busy', 'offline'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const deliveryPerson = await DeliveryPerson.findByPk(id);
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: 'Repartidor no encontrado'
      });
    }

    await deliveryPerson.update({ status });

    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: deliveryPerson
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar repartidor
exports.deleteDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deliveryPerson = await DeliveryPerson.findByPk(id);
    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: 'Repartidor no encontrado'
      });
    }

    await deliveryPerson.destroy();

    res.json({
      success: true,
      message: 'Repartidor eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar repartidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener repartidores disponibles
exports.getAvailableDeliveryPersons = async (req, res) => {
  try {
    const deliveryPersons = await DeliveryPerson.findAll({
      where: { status: 'available' },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: deliveryPersons
    });
  } catch (error) {
    console.error('Error al obtener repartidores disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};