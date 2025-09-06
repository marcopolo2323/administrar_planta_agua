const express = require('express');
const router = express.Router();
const deliveryFeeController = require('../controllers/deliveryFee.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de tarifas de envío
router.get('/', deliveryFeeController.getDeliveryFees);
router.get('/:id', deliveryFeeController.getDeliveryFeeById);
router.post('/', deliveryFeeController.createDeliveryFee);
router.put('/:id', deliveryFeeController.updateDeliveryFee);
router.delete('/:id', deliveryFeeController.deleteDeliveryFee);
router.post('/calculate', deliveryFeeController.calculateDeliveryCost);

module.exports = router;