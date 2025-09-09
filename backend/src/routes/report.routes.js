const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/role.middleware');

// Todas las rutas requieren autenticación y rol de admin
router.use(authMiddleware);
router.use(checkRole(['admin']));

// Generar reporte
router.get('/', reportController.generateReport);

module.exports = router;