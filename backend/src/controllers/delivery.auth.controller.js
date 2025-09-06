const jwt = require('jsonwebtoken');
const { User, DeliveryPerson } = require('../models');
const { Op } = require('sequelize');

// Login para repartidores
exports.loginDeliveryPerson = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario por username con rol de repartidor
    const user = await User.findOne({ 
      where: { 
        username,
        role: 'repartidor'
      } 
    });

    if (!user) {
      return res.status(404).json({ message: 'Repartidor no encontrado' });
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      return res.status(403).json({ message: 'Cuenta desactivada' });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Buscar información del repartidor
    const deliveryPerson = await DeliveryPerson.findOne({ where: { userId: user.id } });
    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Información de repartidor no encontrada' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, deliveryPersonId: deliveryPerson.id },
      process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_aqui_2024',
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      deliveryPerson: {
        id: deliveryPerson.id,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        vehicleType: deliveryPerson.vehicleType,
        vehiclePlate: deliveryPerson.vehiclePlate,
        status: deliveryPerson.status
      },
      token
    });
  } catch (error) {
    console.error('Error en login de repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener perfil de repartidor
exports.getDeliveryPersonProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Verificar que el usuario sea un repartidor
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'role']
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role !== 'repartidor') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Obtener información del repartidor
    const deliveryPerson = await DeliveryPerson.findOne({ where: { userId } });
    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Información de repartidor no encontrada' });
    }

    return res.status(200).json({
      user,
      deliveryPerson
    });
  } catch (error) {
    console.error('Error al obtener perfil de repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar perfil de repartidor
exports.updateDeliveryPersonProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      name, 
      phone, 
      address, 
      vehicleType,
      vehiclePlate
    } = req.body;

    // Verificar que el usuario sea un repartidor
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role !== 'repartidor') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Buscar y actualizar información del repartidor
    const deliveryPerson = await DeliveryPerson.findOne({ where: { userId } });
    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Información de repartidor no encontrada' });
    }

    // Actualizar campos
    await deliveryPerson.update({
      name: name || deliveryPerson.name,
      phone: phone || deliveryPerson.phone,
      address: address || deliveryPerson.address,
      vehicleType: vehicleType || deliveryPerson.vehicleType,
      vehiclePlate: vehiclePlate || deliveryPerson.vehiclePlate
    });

    return res.status(200).json({
      message: 'Perfil actualizado correctamente',
      deliveryPerson
    });
  } catch (error) {
    console.error('Error al actualizar perfil de repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
