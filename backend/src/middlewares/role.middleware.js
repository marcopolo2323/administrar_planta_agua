const { User } = require('../models');

// Middleware para verificar si el usuario tiene un rol específico
exports.checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Verificar que el ID de usuario esté en el request
      if (!req.userId) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      // Buscar el usuario en la base de datos
      const user = await User.findByPk(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Verificar si el usuario tiene uno de los roles permitidos
      if (!roles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Acceso denegado. No tiene los permisos necesarios',
          requiredRoles: roles,
          userRole: user.role
        });
      }

      // Si el usuario tiene el rol adecuado, continuar
      next();
    } catch (error) {
      console.error('Error en verificación de rol:', error);
      return res.status(500).json({ message: 'Error en el servidor' });
    }
  };
};

// Middleware para verificar si el usuario es administrador
exports.isAdmin = exports.checkRole(['admin']);

// Middleware para verificar si el usuario es vendedor
exports.isSeller = exports.checkRole(['admin', 'vendedor']);

// Middleware para verificar si el usuario es cliente
exports.isClient = exports.checkRole(['cliente']);

// Middleware para verificar si el usuario es repartidor
exports.isDeliveryPerson = exports.checkRole(['repartidor']);

// Middleware para verificar si el usuario es cliente o administrador
exports.isClientOrAdmin = exports.checkRole(['cliente', 'admin']);

// Middleware para verificar si el usuario es repartidor o administrador
exports.isDeliveryPersonOrAdmin = exports.checkRole(['repartidor', 'admin']);