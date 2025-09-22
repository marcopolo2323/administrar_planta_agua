const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagement.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de admin
router.get('/', authMiddleware, requireRole(['admin']), userManagementController.getAllUsers);
router.get('/:id', authMiddleware, requireRole(['admin']), userManagementController.getUserById);
router.post('/', authMiddleware, requireRole(['admin']), userManagementController.createUser);
router.put('/:id', authMiddleware, requireRole(['admin']), userManagementController.updateUser);
router.patch('/:id/toggle-status', authMiddleware, requireRole(['admin']), userManagementController.toggleUserStatus);
router.delete('/:id', authMiddleware, requireRole(['admin']), userManagementController.deleteUser);

module.exports = router;
