const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas (no requieren autenticación)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/pricing-info', productController.getPricingInfo);
router.post('/:id/calculate-price', productController.calculatePrice);

// Rutas protegidas (requieren rol de admin)
router.post('/', [authMiddleware, requireAdmin], productController.createProduct);
router.put('/:id', [authMiddleware, requireAdmin], productController.updateProduct);
router.delete('/:id', [authMiddleware, requireAdmin], productController.deleteProduct);
router.put('/:id/stock', [authMiddleware, requireAdmin], productController.updateStock);

module.exports = router;