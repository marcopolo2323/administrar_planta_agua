const express = require('express');
const router = express.Router();
const deliveryOrdersController = require('../controllers/delivery.orders.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Middleware para verificar que es un repartidor
const verifyDeliveryPerson = (req, res, next) => {
  console.log('🔍 verifyDeliveryPerson - req.userRole:', req.userRole);
  console.log('🔍 verifyDeliveryPerson - req.userId:', req.userId);
  
  if (req.userRole !== 'repartidor') {
    console.log('🔍 verifyDeliveryPerson - Acceso denegado, rol:', req.userRole);
    return res.status(403).json({ 
      success: false,
      message: 'Acceso denegado. Solo repartidores pueden acceder a esta funcionalidad.' 
    });
  }
  req.deliveryPersonId = req.deliveryPersonId || req.userId;
  console.log('🔍 verifyDeliveryPerson - deliveryPersonId establecido:', req.deliveryPersonId);
  next();
};

// Aplicar middleware de autenticación y verificación de repartidor
router.use(authMiddleware);
router.use(verifyDeliveryPerson);

// Rutas protegidas para repartidores
router.get('/orders', deliveryOrdersController.getDeliveryOrders);
router.put('/orders/:orderId/status', deliveryOrdersController.updateOrderStatus);
router.get('/stats', deliveryOrdersController.getDeliveryStats);

module.exports = router;
