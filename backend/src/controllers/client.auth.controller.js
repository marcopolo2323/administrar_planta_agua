const jwt = require('jsonwebtoken');
const { User, Client } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Registro de cliente
exports.registerClient = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      name, 
      documentType, 
      documentNumber, 
      address, 
      district, 
      phone, 
      defaultDeliveryAddress,
      defaultContactPhone
    } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Verificar si el número de documento ya existe
    const existingClient = await Client.findOne({ where: { documentNumber } });
    if (existingClient) {
      return res.status(400).json({ message: 'El número de documento ya está registrado' });
    }

    // Crear transacción para asegurar que ambos registros se creen o ninguno
    const result = await sequelize.transaction(async (t) => {
      // Crear usuario con rol de cliente
      const user = await User.create({
        username,
        email,
        password,
        role: 'cliente'
      }, { transaction: t });

      // Crear cliente asociado al usuario
      const client = await Client.create({
        name,
        documentType: documentType || 'DNI',
        documentNumber,
        address,
        district,
        phone,
        email,
        userId: user.id,
        hasCredit: true, // Habilitar crédito para clientes frecuentes
        creditLimit: 1000.00, // Límite de crédito inicial
        defaultDeliveryAddress: defaultDeliveryAddress || address,
        defaultContactPhone: defaultContactPhone || phone
      }, { transaction: t });

      return { user, client };
    });

    // Generar token JWT
    const token = jwt.sign(
      { id: result.user.id, role: result.user.role },
      process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_aqui_2024',
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Cliente registrado correctamente',
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role
      },
      client: {
        id: result.client.id,
        name: result.client.name,
        documentNumber: result.client.documentNumber
      },
      token
    });
  } catch (error) {
    console.error('Error en registro de cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Inicio de sesión para clientes
exports.loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ 
      where: { 
        email,
        role: 'cliente'
      } 
    });

    if (!user) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
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

    // Buscar información del cliente
    const client = await Client.findOne({ where: { userId: user.id } });
    if (!client) {
      return res.status(404).json({ message: 'Información de cliente no encontrada' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, clientId: client.id },
      process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_aqui_2024',
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      client: {
        id: client.id,
        name: client.name,
        documentNumber: client.documentNumber,
        address: client.address,
        phone: client.phone,
        defaultDeliveryAddress: client.defaultDeliveryAddress,
        defaultContactPhone: client.defaultContactPhone
      },
      token
    });
  } catch (error) {
    console.error('Error en login de cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener perfil de cliente
exports.getClientProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Verificar que el usuario sea un cliente
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'role']
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Obtener información del cliente
    const client = await Client.findOne({ where: { userId } });
    if (!client) {
      return res.status(404).json({ message: 'Información de cliente no encontrada' });
    }

    return res.status(200).json({
      user,
      client
    });
  } catch (error) {
    console.error('Error al obtener perfil de cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar perfil de cliente
exports.updateClientProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      name, 
      address, 
      district, 
      phone, 
      defaultDeliveryAddress,
      defaultContactPhone
    } = req.body;

    // Verificar que el usuario sea un cliente
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Buscar y actualizar información del cliente
    const client = await Client.findOne({ where: { userId } });
    if (!client) {
      return res.status(404).json({ message: 'Información de cliente no encontrada' });
    }

    // Actualizar campos
    await client.update({
      name: name || client.name,
      address: address || client.address,
      district: district || client.district,
      phone: phone || client.phone,
      defaultDeliveryAddress: defaultDeliveryAddress || client.defaultDeliveryAddress,
      defaultContactPhone: defaultContactPhone || client.defaultContactPhone
    });

    return res.status(200).json({
      message: 'Perfil actualizado correctamente',
      client
    });
  } catch (error) {
    console.error('Error al actualizar perfil de cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};