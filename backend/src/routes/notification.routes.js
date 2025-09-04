const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken, checkRole, isAdmin } = require('../middlewares/auth.middleware');

// Rutas protegidas por autenticación
router.use(verifyToken);

// Obtener notificaciones del usuario autenticado
router.get('/', notificationController.getUserNotifications);

// Marcar una notificación como leída
router.put('/:id/read', notificationController.markAsRead);

// Marcar todas las notificaciones como leídas
router.put('/mark-all-read', notificationController.markAllAsRead);

// Eliminar una notificación
router.delete('/:id', notificationController.deleteNotification);

// Rutas solo para administradores
// Crear una nueva notificación (solo admin)
router.post('/', isAdmin, notificationController.createNotification);

// Crear múltiples notificaciones (solo admin)
router.post('/bulk', isAdmin, notificationController.createMultipleNotifications);

// Ruta de debug - solo para desarrollo
router.get('/debug', notificationController.debugNotifications);

module.exports = router;