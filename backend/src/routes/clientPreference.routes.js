const express = require('express');
const router = express.Router();
const clientPreferenceController = require('../controllers/clientPreference.controller');
const { checkRole } = require('../middlewares/role.middleware');

// Rutas públicas
router.get('/dni/:dni', clientPreferenceController.getClientPreference);
router.post('/', clientPreferenceController.saveClientPreference);

// Rutas protegidas (solo admin)
router.get('/', checkRole(['admin']), clientPreferenceController.getAllPreferences);
router.put('/deactivate/:dni', checkRole(['admin']), clientPreferenceController.deactivatePreference);

module.exports = router;
