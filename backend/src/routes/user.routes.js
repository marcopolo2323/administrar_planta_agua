const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener usuarios por rol
router.get('/', requireRole(['admin', 'vendedor']), userController.getUsersByRole);

// Obtener todos los usuarios (solo admin)
router.get('/all', requireRole(['admin']), userController.getAllUsers);

module.exports = router;
