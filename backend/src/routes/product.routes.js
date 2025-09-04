const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas (no requieren autenticación)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Rutas protegidas (requieren rol de admin)
router.post('/', [verifyToken, isAdmin], productController.createProduct);
router.put('/:id', [verifyToken, isAdmin], productController.updateProduct);
router.delete('/:id', [verifyToken, isAdmin], productController.deleteProduct);
router.put('/:id/stock', [verifyToken, isAdmin], productController.updateStock);

module.exports = router;