const express = require('express');
const router = express.Router();
const creditController = require('../controllers/credit.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use('/', authMiddleware);

// Rutas para créditos (solo admin y vendedor pueden ver, solo admin puede crear/modificar)
router.get('/', requireRole(['admin', 'vendedor']), creditController.getAllCredits);
router.get('/overdue', requireRole(['admin', 'vendedor']), creditController.getOverdueCredits);
router.get('/:id', requireRole(['admin', 'vendedor']), creditController.getCreditById);
router.get('/:id/payments', requireRole(['admin', 'vendedor']), creditController.getCreditPayments);
router.post('/', requireRole(['admin']), creditController.createCredit);
router.post('/:creditId/payments', requireRole(['admin', 'vendedor']), creditController.registerPayment);

module.exports = router;