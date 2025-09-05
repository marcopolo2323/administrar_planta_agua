const express = require('express');
const router = express.Router();
const electronicInvoiceController = require('../controllers/electronicInvoice.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use('/', authMiddleware);

// Rutas para facturación electrónica
router.get('/', electronicInvoiceController.getAllElectronicInvoices);
router.get('/:id', electronicInvoiceController.getElectronicInvoiceById);
router.post('/generate', electronicInvoiceController.generateElectronicInvoice);
router.post('/:id/resend', electronicInvoiceController.resendElectronicInvoice);
router.post('/:id/send-email', electronicInvoiceController.sendInvoiceByEmail);
router.post('/:id/send-whatsapp', electronicInvoiceController.sendInvoiceByWhatsApp);

module.exports = router;