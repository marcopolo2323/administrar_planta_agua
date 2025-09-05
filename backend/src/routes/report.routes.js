const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas de reportes requieren autenticación y rol de administrador
router.get('/sales/period', [authMiddleware, requireAdmin], reportController.getSalesByPeriod);
router.get('/sales/client', [authMiddleware, requireAdmin], reportController.getSalesByClient);
router.get('/sales/product', [authMiddleware, requireAdmin], reportController.getSalesByProduct);
router.get('/sales/district', [authMiddleware, requireAdmin], reportController.getSalesByDistrict);

module.exports = router;