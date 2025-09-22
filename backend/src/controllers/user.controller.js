const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Obtener usuarios por rol
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro role es requerido'
      });
    }

    const users = await User.findAll({
      where: { role: role },
      attributes: ['id', 'username', 'email', 'role', 'firstName', 'lastName', 'isActive', 'createdAt'],
      order: [['username', 'ASC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los usuarios (solo para admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;
    
    // Construir filtros
    const whereClause = {};
    if (role && role !== 'all') {
      whereClause.role = role;
    }
    
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'username', 'email', 'role', 'firstName', 'lastName', 'isActive', 'createdAt'],
      order: [['username', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        pages: totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
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

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, address, district, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Preparar datos de actualización
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (district) updateData.district = district;
    
    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    await user.update(updateData);

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
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

// Cambiar estado activo/inactivo de usuario
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Cambiar el estado
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
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
