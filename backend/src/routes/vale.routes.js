const express = require('express');
const router = express.Router();
const valeController = require('../controllers/vale.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas (para clientes)
router.get('/client/:clientId', valeController.getClientVales);

// Rutas protegidas (solo admin)
router.get('/', authMiddleware, requireAdmin, valeController.getVales);
router.post('/', authMiddleware, requireAdmin, valeController.createVale);
router.put('/:id', authMiddleware, requireAdmin, valeController.updateVale);
router.post('/use', authMiddleware, requireAdmin, valeController.useVale);
router.get('/stats', authMiddleware, requireAdmin, valeController.getValeStats);

module.exports = router;
