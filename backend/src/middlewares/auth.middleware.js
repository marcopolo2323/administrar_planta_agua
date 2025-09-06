const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar que el header tenga el formato correcto "Bearer token"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    try {
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_aqui_2024');
      
      // Buscar el usuario en la base de datos
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Agregar el usuario al request
      req.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      };
      
      // También agregar userId para compatibilidad
      req.userId = user.id;
      req.userRole = user.role;

      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

// Middleware para verificar si es administrador
const requireAdmin = requireRole(['admin']);

// Middleware para verificar si es vendedor o administrador
const requireSeller = requireRole(['admin', 'vendedor']);

// Middleware para verificar si es repartidor o administrador
const requireDelivery = requireRole(['admin', 'repartidor']);

// Middleware para verificar si es cliente o administrador
const requireClient = requireRole(['admin', 'cliente']);

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  requireSeller,
  requireDelivery,
  requireClient
};
