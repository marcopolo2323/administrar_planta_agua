const express = require('express');
const router = express.Router();
const {
  getSubscriptionPlans,
  createSubscriptionPlan,
  getClientSubscriptions,
  createSubscription,
  processSubscriptionOrder,
  getSubscriptionStats,
  updateSubscriptionStatus
} = require('../controllers/subscription.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/role.middleware');

// Rutas públicas para planes de suscripción
router.get('/plans', getSubscriptionPlans);

// Rutas protegidas para administradores
router.post('/plans', authMiddleware, checkRole(['admin']), createSubscriptionPlan);
router.get('/stats', authMiddleware, checkRole(['admin']), getSubscriptionStats);

// Rutas para clientes (requieren autenticación)
router.get('/client/:clientId', authMiddleware, getClientSubscriptions);
router.post('/client/:clientId/subscribe', authMiddleware, createSubscription);
router.post('/order', authMiddleware, processSubscriptionOrder);
router.put('/:subscriptionId/status', authMiddleware, updateSubscriptionStatus);

module.exports = router;
