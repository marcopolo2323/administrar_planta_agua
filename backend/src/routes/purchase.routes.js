const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use('/', authMiddleware);

// Rutas para compras
router.get('/', purchaseController.getAllPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/', purchaseController.createPurchase);
router.put('/:id/cancel', purchaseController.cancelPurchase);

module.exports = router;