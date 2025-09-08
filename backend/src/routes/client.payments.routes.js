const express = require('express');
const router = express.Router();
const clientPaymentsController = require('../controllers/client.payments.controller');
const { requireRole } = require('../middlewares/auth.middleware');

// Obtener estadísticas de pagos de clientes frecuentes (solo admin)
router.get('/stats', requireRole(['admin']), clientPaymentsController.getClientPaymentStats);

// Obtener detalles de vales de un cliente específico (solo admin)
router.get('/client/:clientId/details', requireRole(['admin']), clientPaymentsController.getClientVoucherDetails);

// Marcar vales como pagados (solo admin)
router.put('/client/:clientId/mark-paid', requireRole(['admin']), clientPaymentsController.markVouchersAsPaid);

module.exports = router;
