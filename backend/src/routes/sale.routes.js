const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas (requieren autenticación pero no admin)
router.get('/', authMiddleware, saleController.getAllSales);
router.get('/today', authMiddleware, saleController.getTodaySales);
router.get('/yesterday', authMiddleware, saleController.getYesterdaySales);
router.get('/weekly', authMiddleware, saleController.getWeeklySales);
router.get('/last-week', authMiddleware, saleController.getLastWeekSales);
router.get('/monthly', authMiddleware, saleController.getMonthlySales);
router.get('/last-month', authMiddleware, saleController.getLastMonthSales);
router.get('/client/:clientId', authMiddleware, saleController.getSalesByClient);
router.get('/date', authMiddleware, saleController.getSalesByDate);
router.get('/:id/pdf', authMiddleware, saleController.generateSalePDF);
router.get('/:id', authMiddleware, saleController.getSaleById);
router.post('/', authMiddleware, saleController.createSale);

// Rutas protegidas (requieren rol de admin)
router.put('/:id/cancel', [authMiddleware, requireAdmin], saleController.cancelSale);

module.exports = router;