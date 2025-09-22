const express = require('express');
const router = express.Router();
const deliveryFeeController = require('../controllers/deliveryFee.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Rutas públicas (no requieren autenticación)
router.get('/', deliveryFeeController.getDeliveryFees);
router.get('/:id', deliveryFeeController.getDeliveryFeeById);
router.post('/calculate', deliveryFeeController.calculateDeliveryCost);

// Rutas protegidas (requieren autenticación de admin)
router.post('/', authMiddleware, requireRole(['admin']), deliveryFeeController.createDeliveryFee);
router.put('/:id', authMiddleware, requireRole(['admin']), deliveryFeeController.updateDeliveryFee);
router.delete('/:id', authMiddleware, requireRole(['admin']), deliveryFeeController.deleteDeliveryFee);

module.exports = router;