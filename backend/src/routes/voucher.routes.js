const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas específicas (deben ir antes que las rutas con parámetros)

// Rutas para administradores - ver todos los vales y estadísticas
router.get('/', requireRole(['admin', 'vendedor']), voucherController.getAllVouchers);
router.get('/stats', requireRole(['admin', 'vendedor']), voucherController.getVoucherStats);

// Rutas para repartidores - crear vales
router.post('/', requireRole(['repartidor']), voucherController.createVoucher);
router.get('/delivery', requireRole(['repartidor']), voucherController.getDeliveryVouchers);
router.get('/delivery/stats', requireRole(['repartidor']), voucherController.getVoucherStats);

// Rutas para clientes - ver sus vales
router.get('/client', requireRole(['cliente']), voucherController.getClientVouchers);
router.get('/client/stats', requireRole(['cliente']), voucherController.getVoucherStats);

// Rutas con parámetros (deben ir al final)
router.get('/:id', voucherController.getVoucherById);
router.put('/:id/status', voucherController.updateVoucherStatus);

module.exports = router;
