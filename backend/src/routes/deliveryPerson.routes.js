const express = require('express');
const router = express.Router();
const deliveryPersonController = require('../controllers/deliveryPerson.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Rutas para administradores
// Crear un nuevo repartidor
router.post('/', verifyToken, roleMiddleware.isAdmin, deliveryPersonController.createDeliveryPerson);

// Obtener todos los repartidores
router.get('/', verifyToken, roleMiddleware.isAdmin, deliveryPersonController.getAllDeliveryPersons);

// Obtener un repartidor por ID
router.get('/:id', verifyToken, roleMiddleware.isAdmin, deliveryPersonController.getDeliveryPersonById);

// Actualizar un repartidor
router.put('/:id', verifyToken, roleMiddleware.isAdmin, deliveryPersonController.updateDeliveryPerson);

// Desactivar un repartidor
router.delete('/:id', verifyToken, roleMiddleware.isAdmin, deliveryPersonController.deactivateDeliveryPerson);

// Actualizar estado de disponibilidad (admin puede cambiar el estado de cualquier repartidor)
router.put('/:id/status', verifyToken, roleMiddleware.isAdmin, deliveryPersonController.updateDeliveryPersonStatus);

// Obtener pedidos asignados a un repartidor específico (para administradores)
router.get('/:id/orders', verifyToken, roleMiddleware.isAdmin, deliveryPersonController.getDeliveryPersonOrders);

// Rutas para repartidores
// Obtener perfil propio del repartidor
router.get('/profile/me', verifyToken, roleMiddleware.isDeliveryPerson, async (req, res) => {
  try {
    // Buscar el repartidor asociado al usuario autenticado
    const deliveryPerson = await require('../models').DeliveryPerson.findOne({
      where: { userId: req.userId },
      include: [{
        model: require('../models').User,
        attributes: ['id', 'username', 'email', 'active']
      }]
    });

    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Perfil de repartidor no encontrado' });
    }

    return res.status(200).json(deliveryPerson);
  } catch (error) {
    console.error('Error al obtener perfil de repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Actualizar estado de disponibilidad propio (solo su propio estado)
router.put('/profile/status', verifyToken, roleMiddleware.isDeliveryPerson, async (req, res) => {
  try {
    const { status } = req.body;

    // Validar estado
    const validStatus = ['disponible', 'en_ruta', 'no_disponible'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: 'Estado no válido',
        validStatus
      });
    }

    // Buscar el repartidor asociado al usuario autenticado
    const deliveryPerson = await require('../models').DeliveryPerson.findOne({
      where: { userId: req.userId }
    });

    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Perfil de repartidor no encontrado' });
    }

    // Actualizar estado
    await deliveryPerson.update({ status });

    return res.status(200).json({
      message: 'Estado actualizado correctamente',
      deliveryPerson
    });
  } catch (error) {
    console.error('Error al actualizar estado del repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener pedidos asignados al repartidor autenticado
router.get('/profile/orders', verifyToken, roleMiddleware.isDeliveryPerson, async (req, res) => {
  try {
    // Buscar el repartidor asociado al usuario autenticado
    const deliveryPerson = await require('../models').DeliveryPerson.findOne({
      where: { userId: req.userId }
    });

    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Perfil de repartidor no encontrado' });
    }

    // Redirigir a la función que obtiene pedidos por repartidor
    req.params.id = deliveryPerson.id;
    return deliveryPersonController.getDeliveryPersonOrders(req, res);
  } catch (error) {
    console.error('Error al obtener pedidos del repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;