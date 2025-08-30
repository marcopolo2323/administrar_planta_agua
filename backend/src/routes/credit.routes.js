const express = require('express');
const router = express.Router();
const creditController = require('../controllers/credit.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use('/', verifyToken);

// Rutas para créditos
router.get('/', creditController.getAllCredits);
router.get('/overdue', creditController.getOverdueCredits);
router.get('/:id', creditController.getCreditById);
router.get('/:id/payments', creditController.getCreditPayments);
router.post('/', creditController.createCredit);
router.post('/:creditId/payments', creditController.registerPayment);

module.exports = router;