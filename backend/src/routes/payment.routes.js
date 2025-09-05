const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware, requireClient, requireSeller } = require('../middlewares/auth.middleware');

// Usar middleware de roles importado

// Rutas públicas (para clientes registrados)
// Crear un nuevo pago
router.post('/', authMiddleware, requireClient, paymentController.createPayment);

// Confirmar pago de PayPal (callback)
router.get('/paypal/confirm', paymentController.confirmPayPalPayment);

// Webhook para notificaciones de MercadoPago
router.post('/webhook/mercadopago', paymentController.mercadoPagoWebhook);

// Rutas para administradores y vendedores
// Obtener todos los pagos
router.get('/', authMiddleware, requireSeller, paymentController.getAllPayments);

// Obtener un pago por ID
router.get('/:id', authMiddleware, requireSeller, paymentController.getPaymentById);

// Actualizar estado de pago manualmente
router.put('/:id/status', authMiddleware, requireSeller, paymentController.updatePaymentStatus);

// Obtener pagos por cliente
router.get('/client/:clientId', authMiddleware, requireSeller, paymentController.getPaymentsByClient);

module.exports = router;