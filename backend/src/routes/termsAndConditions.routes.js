const express = require('express');
const router = express.Router();
const termsAndConditionsController = require('../controllers/termsAndConditions.controller');
const { requireRole } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/active', termsAndConditionsController.getActiveTerms);

// Rutas protegidas (solo admin)
router.get('/', requireRole(['admin']), termsAndConditionsController.getAllTerms);
router.post('/', requireRole(['admin']), termsAndConditionsController.createTerms);
router.put('/:id', requireRole(['admin']), termsAndConditionsController.updateTerms);
router.patch('/:id/toggle', requireRole(['admin']), termsAndConditionsController.toggleTermsStatus);
router.delete('/:id', requireRole(['admin']), termsAndConditionsController.deleteTerms);

module.exports = router;
