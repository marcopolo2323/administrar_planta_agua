const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use('/', verifyToken);

// Rutas para inventario
router.get('/', inventoryController.getAllInventoryMovements);
router.get('/product/:id', inventoryController.getInventoryMovementsByProduct);
router.post('/adjust', inventoryController.createInventoryAdjustment);
router.get('/stock', inventoryController.getCurrentStock);
router.get('/low-stock', inventoryController.getLowStockProducts);

module.exports = router;