const express = require('express');
const router = express.Router();
const deliveryAuthController = require('../controllers/delivery.auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Rutas públicas
router.post('/login', deliveryAuthController.loginDeliveryPerson);

// Rutas protegidas
router.get('/profile', authMiddleware, deliveryAuthController.getDeliveryPersonProfile);
router.put('/profile', authMiddleware, deliveryAuthController.updateDeliveryPersonProfile);

module.exports = router;
