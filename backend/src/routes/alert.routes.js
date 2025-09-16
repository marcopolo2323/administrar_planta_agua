const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { checkRole } = require('../middlewares/role.middleware');

// Rutas protegidas (solo admin)
router.get('/admin', checkRole(['admin']), alertController.getAdminAlerts);
router.get('/client/:clientId/vales', checkRole(['admin', 'repartidor']), alertController.getClientValesForPayment);

module.exports = router;
