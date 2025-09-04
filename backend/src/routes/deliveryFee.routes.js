const express = require('express');
const router = express.Router();
const deliveryFeeController = require('../controllers/deliveryFee.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/', deliveryFeeController.getAllDeliveryFees);
router.get('/district/:district', deliveryFeeController.getDeliveryFeeByDistrict);

// Rutas protegidas (solo admin)
router.post('/', [verifyToken, isAdmin], deliveryFeeController.createDeliveryFee);
router.put('/:id', [verifyToken, isAdmin], deliveryFeeController.updateDeliveryFee);
router.delete('/:id', [verifyToken, isAdmin], deliveryFeeController.deleteDeliveryFee);

module.exports = router;