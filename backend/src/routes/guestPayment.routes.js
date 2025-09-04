const express = require('express');
const router = express.Router();
const guestPaymentController = require('../controllers/guestPayment.controller');

// Rutas públicas (sin autenticación)
// Crear un pago para un pedido de invitado
router.post('/', guestPaymentController.createGuestPayment);

// Verificar estado de pago de un pedido de invitado
router.get('/:orderId', guestPaymentController.getGuestPaymentStatus);

module.exports = router;