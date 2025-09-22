const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios con paginación
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (role && role !== 'all') {
      whereClause.role = role;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] } // Excluir contraseña por seguridad
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear un nuevo usuario
const createUser = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      role, 
      isActive = true,
      // Datos personales
      firstName,
      lastName,
      documentNumber,
      phone,
      address,
      district,
      reference,
      // Datos de repartidor
      vehicleType,
      vehiclePlate,
      licenseNumber,
      insuranceNumber,
      emergencyContact,
      emergencyPhone
    } = req.body;

    // Validar campos requeridos
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: username, email, password, role'
      });
    }

    // Validar que el rol sea válido
    const validRoles = ['admin', 'vendedor', 'repartidor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Debe ser: admin, vendedor o repartidor'
      });
    }

    // Verificar que el username no exista
    const existingUsername = await User.findOne({
      where: { username }
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya existe'
      });
    }

    // Verificar que el email no exista
    const existingEmail = await User.findOne({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'El email ya existe'
      });
    }

    // Verificar que el DNI no exista (si se proporciona)
    if (documentNumber) {
      const existingDni = await User.findOne({
        where: { documentNumber }
      });

      if (existingDni) {
        return res.status(400).json({
          success: false,
          message: 'El DNI ya existe'
        });
      }
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      isActive,
      // Datos personales
      firstName,
      lastName,
      documentNumber,
      phone,
      address,
      district,
      reference,
      // Datos de repartidor
      vehicleType,
      vehiclePlate,
      licenseNumber,
      insuranceNumber,
      emergencyContact,
      emergencyPhone
    });

    // Retornar usuario sin contraseña
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      // Datos personales
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      documentNumber: newUser.documentNumber,
      phone: newUser.phone,
      address: newUser.address,
      district: newUser.district,
      reference: newUser.reference,
      // Datos de repartidor
      vehicleType: newUser.vehicleType,
      vehiclePlate: newUser.vehiclePlate,
      licenseNumber: newUser.licenseNumber,
      insuranceNumber: newUser.insuranceNumber,
      emergencyContact: newUser.emergencyContact,
      emergencyPhone: newUser.emergencyPhone,
      lastLogin: newUser.lastLogin,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userResponse
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar un usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      username, 
      email, 
      password, 
      role, 
      isActive,
      // Datos personales
      firstName,
      lastName,
      documentNumber,
      phone,
      address,
      district,
      reference,
      // Datos de repartidor
      vehicleType,
      vehiclePlate,
      licenseNumber,
      insuranceNumber,
      emergencyContact,
      emergencyPhone
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validar que el rol sea válido si se proporciona
    if (role) {
      const validRoles = ['admin', 'vendedor', 'repartidor'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido. Debe ser: admin, vendedor o repartidor'
        });
      }
    }

    // Verificar que el username no exista (si se está cambiando)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({
        where: { username }
      });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya existe'
        });
      }
    }

    // Verificar que el email no exista (si se está cambiando)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        where: { email }
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'El email ya existe'
        });
      }
    }

    // Verificar que el DNI no exista (si se está cambiando)
    if (documentNumber && documentNumber !== user.documentNumber) {
      const existingDni = await User.findOne({
        where: { documentNumber }
      });

      if (existingDni) {
        return res.status(400).json({
          success: false,
          message: 'El DNI ya existe'
        });
      }
    }

    // Preparar datos para actualizar
    const updateData = {
      username: username || user.username,
      email: email || user.email,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive,
      // Datos personales
      firstName: firstName !== undefined ? firstName : user.firstName,
      lastName: lastName !== undefined ? lastName : user.lastName,
      documentNumber: documentNumber !== undefined ? documentNumber : user.documentNumber,
      phone: phone !== undefined ? phone : user.phone,
      address: address !== undefined ? address : user.address,
      district: district !== undefined ? district : user.district,
      reference: reference !== undefined ? reference : user.reference,
      // Datos de repartidor
      vehicleType: vehicleType !== undefined ? vehicleType : user.vehicleType,
      vehiclePlate: vehiclePlate !== undefined ? vehiclePlate : user.vehiclePlate,
      licenseNumber: licenseNumber !== undefined ? licenseNumber : user.licenseNumber,
      insuranceNumber: insuranceNumber !== undefined ? insuranceNumber : user.insuranceNumber,
      emergencyContact: emergencyContact !== undefined ? emergencyContact : user.emergencyContact,
      emergencyPhone: emergencyPhone !== undefined ? emergencyPhone : user.emergencyPhone
    };

    // Solo actualizar contraseña si se proporciona una nueva
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    // Actualizar usuario
    await user.update(updateData);

    // Retornar usuario actualizado sin contraseña
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      // Datos personales
      firstName: user.firstName,
      lastName: user.lastName,
      documentNumber: user.documentNumber,
      phone: user.phone,
      address: user.address,
      district: user.district,
      reference: user.reference,
      // Datos de repartidor
      vehicleType: user.vehicleType,
      vehiclePlate: user.vehiclePlate,
      licenseNumber: user.licenseNumber,
      insuranceNumber: user.insuranceNumber,
      emergencyContact: user.emergencyContact,
      emergencyPhone: user.emergencyPhone,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userResponse
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cambiar estado de usuario (activar/desactivar)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir desactivar el último admin
    if (user.role === 'admin' && user.isActive) {
      const adminCount = await User.count({
        where: { role: 'admin', isActive: true }
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No se puede desactivar el último administrador'
        });
      }
    }

    // Cambiar estado
    await user.update({ isActive: !user.isActive });

    res.json({
      success: true,
      message: `Usuario ${user.isActive ? 'desactivado' : 'activado'} exitosamente`,
      data: {
        id: user.id,
        username: user.username,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar el último admin
    if (user.role === 'admin') {
      const adminCount = await User.count({
        where: { role: 'admin' }
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el último administrador'
        });
      }
    }

    // Eliminar usuario
    await user.destroy();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
};
