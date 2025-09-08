const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

// Rutas protegidas - solo admin puede actualizar usuarios
router.put('/:id', authMiddleware, requireAdmin, userController.updateUser);

module.exports = router;