const { DeliveryPerson, User, Order } = require('../models');
const sequelize = require('../config/database');

// Crear un nuevo repartidor
exports.createDeliveryPerson = async (req, res) => {
  try {
    const {
      name,
      documentType,
      documentNumber,
      phone,
      email,
      address,
      vehicleType,
      vehiclePlate,
      username,
      password
    } = req.body;

    // Verificar si el número de documento ya existe
    const existingDeliveryPerson = await DeliveryPerson.findOne({ where: { documentNumber } });
    if (existingDeliveryPerson) {
      return res.status(400).json({ message: 'El número de documento ya está registrado' });
    }

    // Verificar si el email ya existe en usuarios
    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
      }
    }

    // Crear transacción para asegurar que ambos registros se creen o ninguno
    const result = await sequelize.transaction(async (t) => {
      // Crear usuario con rol de repartidor
      const user = await User.create({
        username: username || email,
        email,
        password,
        role: 'repartidor'
      }, { transaction: t });

      // Crear repartidor asociado al usuario
      const deliveryPerson = await DeliveryPerson.create({
        name,
        documentType: documentType || 'DNI',
        documentNumber,
        phone,
        email,
        address,
        vehicleType: vehicleType || 'moto',
        vehiclePlate,
        userId: user.id
      }, { transaction: t });

      return { user, deliveryPerson };
    });

    return res.status(201).json({
      message: 'Repartidor registrado correctamente',
      deliveryPerson: {
        id: result.deliveryPerson.id,
        name: result.deliveryPerson.name,
        documentNumber: result.deliveryPerson.documentNumber,
        phone: result.deliveryPerson.phone,
        vehicleType: result.deliveryPerson.vehicleType
      },
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role
      }
    });
  } catch (error) {
    console.error('Error al crear repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Obtener todos los repartidores
exports.getAllDeliveryPersons = async (req, res) => {
  try {
    const deliveryPersons = await DeliveryPerson.findAll({
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'active']
      }],
      where: { active: true }
    });

    return res.status(200).json(deliveryPersons);
  } catch (error) {
    console.error('Error al obtener repartidores:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener un repartidor por ID
exports.getDeliveryPersonById = async (req, res) => {
  try {
    const { id } = req.params;

    const deliveryPerson = await DeliveryPerson.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'active']
      }]
    });

    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Repartidor no encontrado' });
    }

    return res.status(200).json(deliveryPerson);
  } catch (error) {
    console.error('Error al obtener repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar un repartidor
exports.updateDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      address,
      vehicleType,
      vehiclePlate,
      status
    } = req.body;

    const deliveryPerson = await DeliveryPerson.findByPk(id);
    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Repartidor no encontrado' });
    }

    // Actualizar datos del repartidor
    await deliveryPerson.update({
      name: name || deliveryPerson.name,
      phone: phone || deliveryPerson.phone,
      address: address || deliveryPerson.address,
      vehicleType: vehicleType || deliveryPerson.vehicleType,
      vehiclePlate: vehiclePlate || deliveryPerson.vehiclePlate,
      status: status || deliveryPerson.status
    });

    return res.status(200).json({
      message: 'Repartidor actualizado correctamente',
      deliveryPerson
    });
  } catch (error) {
    console.error('Error al actualizar repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Desactivar un repartidor
exports.deactivateDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;

    const deliveryPerson = await DeliveryPerson.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id']
      }]
    });

    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Repartidor no encontrado' });
    }

    // Verificar si tiene pedidos en curso
    const activeOrders = await Order.count({
      where: {
        deliveryPersonId: id,
        status: ['pendiente', 'en_proceso', 'en_camino']
      }
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        message: 'No se puede desactivar el repartidor porque tiene pedidos activos',
        activeOrders
      });
    }

    // Desactivar repartidor y usuario asociado
    await sequelize.transaction(async (t) => {
      await deliveryPerson.update({ active: false }, { transaction: t });
      
      if (deliveryPerson.User && deliveryPerson.User.id) {
        await User.update(
          { active: false },
          { where: { id: deliveryPerson.User.id }, transaction: t }
        );
      }
    });

    return res.status(200).json({
      message: 'Repartidor desactivado correctamente'
    });
  } catch (error) {
    console.error('Error al desactivar repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar estado de disponibilidad
exports.updateDeliveryPersonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar estado
    const validStatus = ['disponible', 'en_ruta', 'no_disponible'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: 'Estado no válido',
        validStatus
      });
    }

    const deliveryPerson = await DeliveryPerson.findByPk(id);
    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Repartidor no encontrado' });
    }

    // Actualizar estado
    await deliveryPerson.update({ status });

    return res.status(200).json({
      message: 'Estado actualizado correctamente',
      deliveryPerson
    });
  } catch (error) {
    console.error('Error al actualizar estado del repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener pedidos asignados a un repartidor
exports.getDeliveryPersonOrders = async (req, res) => {
  try {
    const { id } = req.params;

    const deliveryPerson = await DeliveryPerson.findByPk(id);
    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Repartidor no encontrado' });
    }

    const orders = await Order.findAll({
      where: { deliveryPersonId: id },
      include: [
        {
          model: require('../models').OrderDetail,
          include: [{
            model: require('../models').Product,
            attributes: ['id', 'name', 'price']
          }]
        },
        {
          model: require('../models').Client,
          attributes: ['id', 'name', 'address', 'phone']
        },
        {
          model: require('../models').Payment,
          attributes: ['id', 'amount', 'paymentMethod', 'paymentStatus']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos del repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};