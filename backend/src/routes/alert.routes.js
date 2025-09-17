const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { authMiddleware, requireAdmin, requireDelivery } = require('../middlewares/auth.middleware');

// Rutas protegidas (solo admin)
router.get('/admin', authMiddleware, requireAdmin, alertController.getAdminAlerts);
router.get('/client/:clientId/vales', authMiddleware, requireDelivery, alertController.getClientValesForPayment);

module.exports = router;
