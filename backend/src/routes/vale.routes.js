const express = require('express');
const router = express.Router();
const valeController = require('../controllers/vale.controller');
const { checkRole } = require('../middlewares/role.middleware');

// Rutas públicas (para clientes)
router.get('/client/:clientId', valeController.getClientVales);

// Rutas protegidas (solo admin)
router.get('/', checkRole(['admin']), valeController.getVales);
router.post('/', checkRole(['admin']), valeController.createVale);
router.put('/:id', checkRole(['admin']), valeController.updateVale);
router.post('/use', checkRole(['admin']), valeController.useVale);
router.get('/stats', checkRole(['admin']), valeController.getValeStats);

module.exports = router;
