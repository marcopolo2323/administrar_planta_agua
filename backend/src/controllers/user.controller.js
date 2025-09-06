const { User } = require('../models');

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
      attributes: ['id', 'username', 'email', 'role'],
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
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role'],
      order: [['username', 'ASC']]
    });

    res.json({
      success: true,
      data: users
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
