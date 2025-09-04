const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas (requieren autenticación pero no admin)
router.get('/', verifyToken, saleController.getAllSales);
router.get('/client/:clientId', verifyToken, saleController.getSalesByClient);
router.get('/date', verifyToken, saleController.getSalesByDate);
router.get('/:id/pdf', verifyToken, saleController.generateSalePDF);
router.get('/:id', verifyToken, saleController.getSaleById);
router.post('/', verifyToken, saleController.createSale);

// Rutas protegidas (requieren rol de admin)
router.put('/:id/cancel', [verifyToken, isAdmin], saleController.cancelSale);

module.exports = router;