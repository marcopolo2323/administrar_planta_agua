const express = require('express');
const router = express.Router();
const districtController = require('../controllers/district.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Rutas públicas para obtener distritos
router.get('/', districtController.getDistricts);

// Ruta pública para calcular flete automáticamente
router.post('/calculate-delivery-fee', districtController.calculateDeliveryFee);

// Rutas públicas para gestión de distritos
router.post('/', districtController.createDistrict);
router.put('/:id', districtController.updateDistrict);
router.delete('/:id', districtController.deleteDistrict);

module.exports = router;
