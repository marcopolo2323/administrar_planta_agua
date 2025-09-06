const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use('/', authMiddleware);

// Rutas para inventario (solo admin y vendedor pueden ver, solo admin puede modificar)
router.get('/', requireRole(['admin', 'vendedor']), inventoryController.getAllInventoryMovements);
router.get('/product/:id', requireRole(['admin', 'vendedor']), inventoryController.getInventoryMovementsByProduct);
router.post('/adjust', requireRole(['admin']), inventoryController.createInventoryAdjustment);
router.get('/stock', requireRole(['admin', 'vendedor']), inventoryController.getCurrentStock);
router.get('/low-stock', requireRole(['admin', 'vendedor']), inventoryController.getLowStockProducts);

module.exports = router;