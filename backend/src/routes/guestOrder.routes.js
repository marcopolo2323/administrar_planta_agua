const express = require('express');
const router = express.Router();
const guestOrderController = require('../controllers/guestOrder.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Rutas públicas (sin autenticación)
router.post('/', (req, res) => guestOrderController.createGuestOrder(req, res));
router.get('/track/:id', (req, res) => guestOrderController.getGuestOrderById(req, res));

// Rutas protegidas (solo admin, vendedor y repartidor)
router.get('/', verifyToken, checkRole(['admin', 'vendedor', 'repartidor']), (req, res) => guestOrderController.getAllGuestOrders(req, res));
router.put('/:id/status', verifyToken, checkRole(['admin', 'vendedor', 'repartidor']), (req, res) => guestOrderController.updateGuestOrderStatus(req, res));
// Actualizar estado de pago de un pedido de invitado (admin, vendedor, repartidor)
router.put('/:id/payment-status', verifyToken, checkRole(['admin', 'vendedor', 'repartidor']), (req, res) => guestOrderController.updateGuestOrderPaymentStatus(req, res));

// Asignar repartidor a un pedido de invitado
router.put('/:id/assign-delivery', verifyToken, checkRole(['admin']), (req, res) => guestOrderController.assignDeliveryPerson(req, res));

module.exports = router;