const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authMiddleware, requireRole, requireAdmin } = require('../middlewares/auth.middleware');

// Rutas protegidas por autenticación
router.use(authMiddleware);

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
router.post('/', requireAdmin, notificationController.createNotification);

// Crear múltiples notificaciones (solo admin)
router.post('/bulk', requireAdmin, notificationController.createMultipleNotifications);

// Ruta de debug - solo para desarrollo
router.get('/debug', notificationController.debugNotifications);

// Ruta de prueba para crear notificaciones de test
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const { createNotificationService } = require('../controllers/notification.controller');
    
    const testNotification = await createNotificationService({
      userId: req.user.id.toString(),
      userModel: req.user.role === 'admin' || req.user.role === 'vendedor' ? 'User' : 
                req.user.role === 'cliente' ? 'Client' : 'DeliveryPerson',
      title: 'Notificación de Prueba',
      message: 'Esta es una notificación de prueba del sistema',
      type: 'new_order'
    });
    
    res.json({ message: 'Notificación de prueba creada', notification: testNotification });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear notificación de prueba', error: error.message });
  }
});

module.exports = router;