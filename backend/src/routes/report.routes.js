const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de reportes (solo administradores)
router.get('/', requireRole(['admin']), reportController.generateReport);

module.exports = router;