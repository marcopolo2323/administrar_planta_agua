const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Usar middleware de roles importado

// Rutas públicas (para clientes registrados)
// Crear un nuevo pago
router.post('/', verifyToken, roleMiddleware.isClient, paymentController.createPayment);

// Confirmar pago de PayPal (callback)
router.get('/paypal/confirm', paymentController.confirmPayPalPayment);

// Webhook para notificaciones de MercadoPago
router.post('/webhook/mercadopago', paymentController.mercadoPagoWebhook);

// Rutas para administradores y vendedores
// Obtener todos los pagos
router.get('/', verifyToken, roleMiddleware.isSeller, paymentController.getAllPayments);

// Obtener un pago por ID
router.get('/:id', verifyToken, roleMiddleware.isSeller, paymentController.getPaymentById);

// Actualizar estado de pago manualmente
router.put('/:id/status', verifyToken, roleMiddleware.isSeller, paymentController.updatePaymentStatus);

// Obtener pagos por cliente
router.get('/client/:clientId', verifyToken, roleMiddleware.isSeller, paymentController.getPaymentsByClient);

module.exports = router;