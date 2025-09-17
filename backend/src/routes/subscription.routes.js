const express = require('express');
const router = express.Router();
const { 
  getClientSubscriptions, 
  createSubscription, 
  useSubscriptionBottles, 
  getAllSubscriptions,
  getSubscriptionStats 
} = require('../controllers/subscription.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/client/:dni', getClientSubscriptions);
router.post('/', createSubscription);
router.post('/use-bottles', useSubscriptionBottles);

// Rutas protegidas (requieren autenticación de admin)
router.get('/stats', authMiddleware, requireAdmin, getSubscriptionStats);
router.get('/', authMiddleware, requireAdmin, getAllSubscriptions);

module.exports = router;