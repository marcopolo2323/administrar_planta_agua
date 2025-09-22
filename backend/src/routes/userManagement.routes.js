const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagement.controller');
const { requireRole } = require('../middlewares/auth.middleware');

// Todas las rutas requieren rol de admin
router.get('/', requireRole(['admin']), userManagementController.getAllUsers);
router.get('/:id', requireRole(['admin']), userManagementController.getUserById);
router.post('/', requireRole(['admin']), userManagementController.createUser);
router.put('/:id', requireRole(['admin']), userManagementController.updateUser);
router.patch('/:id/toggle-status', requireRole(['admin']), userManagementController.toggleUserStatus);
router.delete('/:id', requireRole(['admin']), userManagementController.deleteUser);

module.exports = router;
