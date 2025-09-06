const express = require('express');
const router = express.Router();
const guestOrderController = require('../controllers/guestOrder.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Rutas públicas (sin autenticación)
router.post('/', guestOrderController.createGuestOrder);
router.get('/:id', guestOrderController.getGuestOrderById);

// Rutas de pedidos de invitados (requieren autenticación y roles específicos)
router.get('/', [authMiddleware, requireRole(['admin', 'vendedor'])], guestOrderController.getGuestOrders);
router.get('/stats', [authMiddleware, requireRole(['admin', 'vendedor'])], guestOrderController.getOrderStats);
router.put('/:id/status', [authMiddleware, requireRole(['admin', 'vendedor'])], guestOrderController.updateOrderStatus);
router.put('/:id/assign-delivery', [authMiddleware, requireRole(['admin', 'vendedor'])], guestOrderController.assignDeliveryPerson);
router.delete('/:id', [authMiddleware, requireRole(['admin'])], guestOrderController.deleteGuestOrder);

module.exports = router;