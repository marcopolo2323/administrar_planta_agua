const express = require('express');
const router = express.Router();
const termsAndConditionsController = require('../controllers/termsAndConditions.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/active', termsAndConditionsController.getActiveTerms);

// Rutas protegidas (solo admin) - aplicar middleware individualmente
router.get('/', authMiddleware, requireRole(['admin']), termsAndConditionsController.getAllTerms);
router.post('/', authMiddleware, requireRole(['admin']), termsAndConditionsController.createTerms);
router.put('/:id', authMiddleware, requireRole(['admin']), termsAndConditionsController.updateTerms);
router.patch('/:id/toggle', authMiddleware, requireRole(['admin']), termsAndConditionsController.toggleTermsStatus);
router.delete('/:id', authMiddleware, requireRole(['admin']), termsAndConditionsController.deleteTerms);

module.exports = router;
