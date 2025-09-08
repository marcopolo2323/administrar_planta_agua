const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      role, 
      isClient, 
      phone, 
      address, 
      district, 
      reference 
    } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Determinar el rol del usuario
    let userRole = role;
    
    // Si isClient es true, asignar rol de cliente
    if (isClient) {
      userRole = 'cliente';
    } 
    // Si no se especifica un rol, usar el valor predeterminado (ahora es 'cliente' según el modelo)
    else if (!userRole) {
      userRole = 'cliente';
    }
    
    // Validar que el rol sea válido
    const validRoles = ['admin', 'vendedor', 'cliente', 'repartidor'];
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ message: 'Rol no válido' });
    }

    // Crear nuevo usuario
    const user = await User.create({
      username,
      email,
      password,
      role: userRole,
      phone: phone || null,
      address: address || null,
      district: district || null,
      reference: reference || null
    });

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        district: user.district
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Inicio de sesión
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario por username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      return res.status(403).json({ message: 'Usuario desactivado' });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const expiration = process.env.JWT_EXPIRATION || '7d';
    console.log('🔑 Generando JWT con expiración:', expiration);
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_aqui_2024',
      { expiresIn: expiration }
    );

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        district: user.district,
        reference: user.reference,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener perfil de usuario
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'role', 'phone', 'address', 'district', 'reference', 'active', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Renovar token JWT
exports.refreshToken = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'role', 'phone', 'address', 'district', 'reference', 'active', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar nuevo token
    const expiration = process.env.JWT_EXPIRATION || '7d';
    console.log('🔄 Renovando JWT con expiración:', expiration);
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_aqui_2024',
      { expiresIn: expiration }
    );

    return res.status(200).json({
      message: 'Token renovado exitosamente',
      token,
      user
    });
  } catch (error) {
    console.error('Error al renovar token:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};