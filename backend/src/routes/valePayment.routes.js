const express = require('express');
const router = express.Router();
const valePaymentController = require('../controllers/valePayment.controller');
const { checkRole } = require('../middlewares/role.middleware');

// Rutas para pago de vales
router.get('/summary/:clientId', checkRole(['admin', 'repartidor']), valePaymentController.getValePaymentSummary);
router.post('/process', checkRole(['admin', 'repartidor']), valePaymentController.processValePayment);

module.exports = router;
