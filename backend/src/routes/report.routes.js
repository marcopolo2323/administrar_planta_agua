const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas de reportes requieren autenticación y rol de administrador
router.get('/sales/period', [verifyToken, isAdmin], reportController.getSalesByPeriod);
router.get('/sales/client', [verifyToken, isAdmin], reportController.getSalesByClient);
router.get('/sales/product', [verifyToken, isAdmin], reportController.getSalesByProduct);
router.get('/sales/district', [verifyToken, isAdmin], reportController.getSalesByDistrict);

module.exports = router;