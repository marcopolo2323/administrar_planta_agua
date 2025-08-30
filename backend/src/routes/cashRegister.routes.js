const express = require('express');
const router = express.Router();
const cashRegisterController = require('../controllers/cashRegister.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use('/', verifyToken);

// Rutas para caja
router.get('/current', cashRegisterController.getCurrentCashRegister);
router.get('/history', cashRegisterController.getCashRegisterHistory);
router.get('/:id', cashRegisterController.getCashRegisterDetails);
router.post('/open', cashRegisterController.openCashRegister);
router.post('/close', cashRegisterController.closeCashRegister);
router.post('/movement', cashRegisterController.registerCashMovement);

module.exports = router;