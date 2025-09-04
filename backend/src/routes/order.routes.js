const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Rutas públicas (para clientes registrados)
// Crear un nuevo pedido
router.post('/', verifyToken, checkRole(['cliente']), orderController.createOrder);

// Obtener pedidos del cliente autenticado
router.get('/my-orders', verifyToken, checkRole(['cliente']), async (req, res) => {
  // Redirigir a la función que obtiene pedidos por cliente usando el ID del usuario autenticado
  req.params.clientId = req.userId;
  return orderController.getOrdersByClient(req, res);
});

// Obtener un pedido específico del cliente autenticado
router.get('/my-orders/:id', verifyToken, checkRole(['cliente']), async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.userId;
    
    // Buscar el pedido
    const order = await require('../models').Order.findOne({
      where: { id: orderId, clientId: userId }
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Redirigir a la función que obtiene un pedido por ID
    return orderController.getOrderById(req, res);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Rutas para administradores y vendedores
// Obtener todos los pedidos
router.get('/', verifyToken, checkRole(['admin', 'vendedor']), orderController.getAllOrders);

// Obtener un pedido por ID
router.get('/:id', verifyToken, checkRole(['admin', 'vendedor']), orderController.getOrderById);

// Actualizar estado de un pedido
router.put('/:id/status', verifyToken, checkRole(['admin', 'vendedor']), orderController.updateOrderStatus);

// Asignar repartidor a un pedido
router.put('/:id/assign', verifyToken, checkRole(['admin']), orderController.assignDeliveryPerson);

// Actualizar estado de pago
router.put('/:id/payment', verifyToken, checkRole(['admin', 'vendedor']), orderController.updatePaymentStatus);

// Obtener pedidos por cliente
router.get('/client/:clientId', verifyToken, checkRole(['admin', 'vendedor']), orderController.getOrdersByClient);

// Rutas para repartidores
// Obtener pedidos asignados al repartidor autenticado
router.get('/delivery/my-assignments', verifyToken, checkRole(['repartidor']), async (req, res) => {
  // Redirigir a la función que obtiene pedidos por repartidor usando el ID del usuario autenticado
  req.params.deliveryPersonId = req.userId;
  return orderController.getOrdersByDeliveryPerson(req, res);
});

// Actualizar estado de un pedido asignado al repartidor
router.put('/delivery/:id/status', verifyToken, checkRole(['repartidor']), async (req, res) => {
  try {
    const orderId = req.params.id;
    const deliveryPersonId = req.userId;
    
    // Verificar que el pedido está asignado al repartidor autenticado
    const order = await require('../models').Order.findOne({
      where: { id: orderId, deliveryPersonId }
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado o no asignado a este repartidor' });
    }
    
    // Validar que solo pueda cambiar a estados permitidos para repartidores
    const { status } = req.body;
    const allowedStatusChanges = ['en_camino', 'entregado'];
    
    if (!allowedStatusChanges.includes(status)) {
      return res.status(400).json({ message: 'Estado no permitido para repartidores' });
    }
    
    // Redirigir a la función que actualiza el estado del pedido
    return orderController.updateOrderStatus(req, res);
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;