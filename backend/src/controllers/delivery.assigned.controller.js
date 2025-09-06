const { GuestOrder, GuestOrderProduct, Product, District, DeliveryFee } = require('../models');
const { Op } = require('sequelize');

// Obtener pedidos asignados al repartidor autenticado
exports.getAssignedOrders = async (req, res) => {
  try {
    const deliveryPersonId = req.userId; // ID del repartidor autenticado
    const { status } = req.query;

    const whereClause = {
      deliveryPersonId: deliveryPersonId
    };

    // Filtrar por estado si se proporciona
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const orders = await GuestOrder.findAll({
      where: whereClause,
      include: [
        {
          model: GuestOrderProduct,
          as: 'products',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'description', 'image']
            }
          ]
        },
        {
          model: District,
          as: 'district',
          attributes: ['id', 'name', 'deliveryFee']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error al obtener pedidos asignados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener un pedido específico asignado al repartidor
exports.getAssignedOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryPersonId = req.userId;

    const order = await GuestOrder.findOne({
      where: {
        id: id,
        deliveryPersonId: deliveryPersonId
      },
      include: [
        {
          model: GuestOrderProduct,
          as: 'products',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'description', 'image']
            }
          ]
        },
        {
          model: District,
          as: 'district',
          attributes: ['id', 'name', 'deliveryFee']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado o no asignado a este repartidor'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error al obtener pedido asignado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar estado de un pedido (solo repartidor asignado)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const deliveryPersonId = req.userId;

    // Estados permitidos para repartidores
    const allowedStatuses = ['preparing', 'ready', 'delivered'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido para repartidores'
      });
    }

    const order = await GuestOrder.findOne({
      where: {
        id: id,
        deliveryPersonId: deliveryPersonId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado o no asignado a este repartidor'
      });
    }

    await order.update({ status });

    res.json({
      success: true,
      message: 'Estado del pedido actualizado correctamente',
      data: order
    });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas del repartidor
exports.getDeliveryStats = async (req, res) => {
  try {
    const deliveryPersonId = req.userId;
    const { startDate, endDate } = req.query;

    const whereClause = {
      deliveryPersonId: deliveryPersonId
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const totalOrders = await GuestOrder.count({ where: whereClause });
    const deliveredOrders = await GuestOrder.count({ 
      where: { ...whereClause, status: 'delivered' } 
    });
    const pendingOrders = await GuestOrder.count({ 
      where: { 
        ...whereClause, 
        status: { [Op.in]: ['confirmed', 'preparing', 'ready'] } 
      } 
    });

    // Calcular total de entregas
    const orders = await GuestOrder.findAll({
      where: { ...whereClause, status: 'delivered' },
      attributes: ['totalAmount']
    });
    
    const totalDeliveries = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        deliveredOrders,
        pendingOrders,
        totalDeliveries,
        deliveryRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del repartidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
