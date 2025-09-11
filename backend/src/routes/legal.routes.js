const express = require('express');
const router = express.Router();
const legalController = require('../controllers/legal.controller');

// Rutas públicas para términos y condiciones
router.get('/terms', legalController.getTermsAndConditions);
router.get('/privacy', legalController.getPrivacyPolicy);

// Ruta para aceptar términos y condiciones
router.post('/accept-terms', legalController.acceptTermsAndConditions);

module.exports = router;
