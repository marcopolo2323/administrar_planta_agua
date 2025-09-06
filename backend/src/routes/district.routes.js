const express = require('express');
const router = express.Router();
const districtController = require('../controllers/district.controller');

// Rutas públicas para obtener distritos
router.get('/', districtController.getDistricts);

// Ruta pública para calcular flete automáticamente
router.post('/calculate-delivery-fee', districtController.calculateDeliveryFee);

// Rutas protegidas (requieren autenticación)
// router.post('/', authMiddleware, districtController.createDistrict);
// router.put('/:id', authMiddleware, districtController.updateDistrict);
// router.delete('/:id', authMiddleware, districtController.deleteDistrict);

module.exports = router;
