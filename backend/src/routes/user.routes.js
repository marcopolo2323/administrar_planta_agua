const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

// Rutas protegidas - solo admin puede acceder
router.get('/', authMiddleware, requireAdmin, userController.getAllUsers);
router.get('/role', authMiddleware, requireAdmin, userController.getUsersByRole);
router.post('/', authMiddleware, requireAdmin, userController.createUser);
router.put('/:id', authMiddleware, requireAdmin, userController.updateUser);
router.patch('/:id/toggle-status', authMiddleware, requireAdmin, userController.toggleUserStatus);

module.exports = router;