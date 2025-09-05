const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas (requieren autenticación pero no admin)
router.get('/', authMiddleware, saleController.getAllSales);
router.get('/client/:clientId', authMiddleware, saleController.getSalesByClient);
router.get('/date', authMiddleware, saleController.getSalesByDate);
router.get('/:id/pdf', authMiddleware, saleController.generateSalePDF);
router.get('/:id', authMiddleware, saleController.getSaleById);
router.post('/', authMiddleware, saleController.createSale);

// Rutas protegidas (requieren rol de admin)
router.put('/:id/cancel', [authMiddleware, requireAdmin], saleController.cancelSale);

module.exports = router;