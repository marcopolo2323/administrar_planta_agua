const express = require('express');
const router = express.Router();
const deliveryFeeController = require('../controllers/deliveryFee.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/', deliveryFeeController.getAllDeliveryFees);
router.get('/district/:district', deliveryFeeController.getDeliveryFeeByDistrict);

// Rutas protegidas (solo admin)
router.post('/', [authMiddleware, requireAdmin], deliveryFeeController.createDeliveryFee);
router.put('/:id', [authMiddleware, requireAdmin], deliveryFeeController.updateDeliveryFee);
router.delete('/:id', [authMiddleware, requireAdmin], deliveryFeeController.deleteDeliveryFee);

module.exports = router;