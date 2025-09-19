const express = require('express');
const router = express.Router();
const clientPreferencesController = require('../controllers/clientPreferences.controller');

// Ruta pública para obtener preferencias por DNI
router.get('/dni/:dni', clientPreferencesController.getClientPreferencesByDni);

// Ruta pública para crear/actualizar preferencias
router.post('/', clientPreferencesController.createOrUpdateClientPreferences);

// Rutas adicionales (pueden requerir autenticación en el futuro)
router.get('/client/:clientId', clientPreferencesController.getClientPreferencesById);
router.delete('/dni/:dni', clientPreferencesController.deactivateClientPreferences);

// Ruta de mantenimiento para limpiar preferencias expiradas
router.post('/cleanup-expired', clientPreferencesController.cleanExpiredPreferences);

module.exports = router;
