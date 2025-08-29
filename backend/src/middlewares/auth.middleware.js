const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verificar token JWT
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(403).json({ message: 'No se proporcionó token de autenticación' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    // Verificar si el usuario existe y está activo
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Usuario desactivado' });
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado' });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    console.error('Error en verificación de token:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Verificar rol de administrador
exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Requiere rol de administrador' });
    }

    next();
  } catch (error) {
    console.error('Error en verificación de rol:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};