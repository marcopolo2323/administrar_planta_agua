const express = require('express');
const router = express.Router();
const deliveryPersonController = require('../controllers/deliveryPerson.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de repartidores
router.get('/', deliveryPersonController.getDeliveryPersons);
router.get('/available', deliveryPersonController.getAvailableDeliveryPersons);
router.get('/:id', deliveryPersonController.getDeliveryPersonById);
router.post('/', deliveryPersonController.createDeliveryPerson);
router.put('/:id', deliveryPersonController.updateDeliveryPerson);
router.put('/:id/status', deliveryPersonController.updateDeliveryPersonStatus);
router.delete('/:id', deliveryPersonController.deleteDeliveryPerson);

module.exports = router;