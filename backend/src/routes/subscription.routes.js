const express = require('express');
const router = express.Router();
const { 
  getClientSubscriptions, 
  createSubscription, 
  useSubscriptionBottles, 
  getSubscriptionStats 
} = require('../controllers/subscription.controller');

// Rutas públicas
router.get('/client/:dni', getClientSubscriptions);
router.post('/', createSubscription);
router.post('/use-bottles', useSubscriptionBottles);

// Rutas protegidas (requieren autenticación de admin)
router.get('/stats', getSubscriptionStats);

module.exports = router;