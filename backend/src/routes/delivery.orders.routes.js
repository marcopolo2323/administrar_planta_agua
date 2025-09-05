const express = require('express');
const router = express.Router();
const deliveryOrdersController = require('../controllers/delivery.orders.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Middleware para verificar que es un repartidor
const verifyDeliveryPerson = (req, res, next) => {
  if (req.userRole !== 'repartidor') {
    return res.status(403).json({ 
      success: false,
      message: 'Acceso denegado. Solo repartidores pueden acceder a esta funcionalidad.' 
    });
  }
  req.deliveryPersonId = req.deliveryPersonId || req.userId;
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
