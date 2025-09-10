const express = require('express');
const router = express.Router();
const monthlyPaymentController = require('../controllers/monthlyPayment.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/role.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener resumen mensual del cliente
router.get('/client/summary', monthlyPaymentController.getClientMonthlySummary);

// Procesar pago mensual completo
router.post('/client/pay-monthly', monthlyPaymentController.processMonthlyPayment);

// Obtener historial de pagos mensuales
router.get('/client/history', monthlyPaymentController.getPaymentHistory);

module.exports = router;
