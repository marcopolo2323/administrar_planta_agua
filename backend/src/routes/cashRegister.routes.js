const express = require('express');
const router = express.Router();
const cashRegisterController = require('../controllers/cashRegister.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de caja
router.post('/open', cashRegisterController.openCashRegister);
router.post('/close', cashRegisterController.closeCashRegister);
router.get('/current', cashRegisterController.getCurrentCashRegister);
router.get('/history', cashRegisterController.getCashRegisterHistory);
router.post('/movement', cashRegisterController.addCashMovement);
router.get('/stats', cashRegisterController.getCashRegisterStats);

module.exports = router;