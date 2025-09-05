const { Order, OrderDetail, Product, Client, GuestOrder, DeliveryPerson } = require('../models');
const { Op } = require('sequelize');

// Obtener pedidos asignados a un repartidor
exports.getDeliveryOrders = async (req, res) => {
  try {
    const deliveryPersonId = req.deliveryPersonId;
    const { status } = req.query;

    // Construir filtros
    const whereClause = {
      deliveryPersonId: deliveryPersonId
    };

    if (status) {
      whereClause.status = status;
    }

    // Obtener pedidos con detalles
    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: OrderDetail,
          include: [Product]
        },
        {
          model: Client,
          attributes: ['id', 'name', 'phone', 'address', 'district']
        },
        {
          model: GuestOrder,
          attributes: ['guestName', 'guestPhone', 'guestEmail']
        }
      ],
      order: [['orderDate', 'DESC']]
    });

    // Formatear respuesta
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: `PED-${order.id.toString().padStart(3, '0')}`,
      customerName: order.Client ? order.Client.name : order.GuestOrder?.guestName,
      customerPhone: order.Client ? order.Client.phone : order.GuestOrder?.guestPhone,
      address: order.Client ? order.Client.address : order.deliveryAddress,
      district: order.Client ? order.Client.district : order.deliveryDistrict,
      products: order.OrderDetails.map(detail => ({
        name: detail.Product.name,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal
      })),
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      status: order.status,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      notes: order.notes,
      isGuestOrder: !!order.GuestOrder
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Error al obtener pedidos de repartidor:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener pedidos' 
    });
  }
};

// Actualizar estado de un pedido
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    const deliveryPersonId = req.deliveryPersonId;

    // Verificar que el pedido existe y está asignado al repartidor
    const order = await Order.findOne({
      where: {
        id: orderId,
        deliveryPersonId: deliveryPersonId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado o no asignado'
      });
    }

    // Actualizar estado del pedido
    await order.update({
      status: status,
      notes: notes || order.notes,
      deliveryDate: status === 'entregado' ? new Date() : order.deliveryDate
    });

    res.status(200).json({
      success: true,
      message: 'Estado del pedido actualizado correctamente',
      data: {
        id: order.id,
        status: order.status,
        deliveryDate: order.deliveryDate
      }
    });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar estado del pedido' 
    });
  }
};

// Obtener estadísticas del repartidor
exports.getDeliveryStats = async (req, res) => {
  try {
    const deliveryPersonId = req.deliveryPersonId;

    // Obtener estadísticas de pedidos
    const totalOrders = await Order.count({
      where: { deliveryPersonId }
    });

    const pendingOrders = await Order.count({
      where: { 
        deliveryPersonId,
        status: 'en_camino'
      }
    });

    const deliveredOrders = await Order.count({
      where: { 
        deliveryPersonId,
        status: 'entregado'
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.count({
      where: { 
        deliveryPersonId,
        orderDate: {
          [Op.gte]: today
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        todayOrders
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener estadísticas' 
    });
  }
};
