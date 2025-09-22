const express = require('express');
const router = express.Router();
const { 
  getAllPlans, 
  getPlanById, 
  createPlan, 
  updatePlan, 
  deletePlan, 
  getPlanStats 
} = require('../controllers/subscriptionPlan.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/', getAllPlans);
router.get('/:id', getPlanById);

// Rutas protegidas (requieren autenticación de admin)
router.post('/', authMiddleware, requireRole(['admin']), createPlan);
router.put('/:id', authMiddleware, requireRole(['admin']), updatePlan);
router.delete('/:id', authMiddleware, requireRole(['admin']), deletePlan);
router.get('/stats/overview', authMiddleware, requireRole(['admin']), getPlanStats);

module.exports = router;
