const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Enviar recordatorio de pago a un cliente específico
router.post('/payment-reminder/:clientId', requireRole(['admin', 'vendedor']), notificationController.sendPaymentReminder);

// Enviar recordatorios de fin de mes a todos los clientes
router.post('/monthly-reminders', requireRole(['admin']), notificationController.sendMonthlyReminders);

module.exports = router;