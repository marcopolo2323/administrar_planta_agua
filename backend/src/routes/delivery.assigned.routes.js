const express = require('express');
const router = express.Router();
const deliveryAssignedController = require('../controllers/delivery.assigned.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación y verificar que es repartidor
router.use(authMiddleware);
router.use(requireRole(['repartidor']));

// Rutas para repartidores - solo pueden ver sus pedidos asignados
router.get('/orders', deliveryAssignedController.getAssignedOrders);
router.get('/orders/:id', deliveryAssignedController.getAssignedOrderById);
router.put('/orders/:id/status', deliveryAssignedController.updateOrderStatus);
router.get('/stats', deliveryAssignedController.getDeliveryStats);

module.exports = router;
