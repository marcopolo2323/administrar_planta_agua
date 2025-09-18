const { GuestOrder, GuestOrderProduct, Product } = require('../models');
const { Op } = require('sequelize');

// Obtener pedidos asignados a un repartidor (solo guest orders)
exports.getDeliveryOrders = async (req, res) => {
  try {
    console.log('🔍 getDeliveryOrders - Iniciando...');
    const deliveryPersonId = req.deliveryPersonId;
    const { status } = req.query;
    
    console.log('🔍 deliveryPersonId:', deliveryPersonId);
    console.log('🔍 status:', status);

    // Construir filtros
    const whereClause = {
      deliveryPersonId: deliveryPersonId
    };

    if (status) {
      whereClause.status = status;
    }

    // Obtener pedidos de visitantes asignados al repartidor
    console.log('🔍 Buscando pedidos con whereClause:', whereClause);
    const guestOrders = await GuestOrder.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    console.log('🔍 Pedidos encontrados:', guestOrders.length);

    // Obtener productos para cada pedido por separado (con manejo de errores)
    for (let order of guestOrders) {
      try {
        const products = await GuestOrderProduct.findAll({
          where: { guestOrderId: order.id },
          include: [{
            model: Product,
            as: 'product'
          }]
        });
        order.dataValues.products = products;
      } catch (productError) {
        console.error(`Error al cargar productos para pedido ${order.id}:`, productError);
        order.dataValues.products = [];
      }
    }

    // Formatear respuesta
    console.log('🔍 Primer pedido completo:', JSON.stringify(guestOrders[0], null, 2));
    const formattedOrders = guestOrders.map(order => ({
      id: order.id,
      orderNumber: `PED-${order.id.toString().padStart(3, '0')}`,
      type: 'guest',
      // Datos del cliente (compatibilidad con frontend)
      clientName: order.customerName,
      clientPhone: order.customerPhone,
      clientEmail: order.customerEmail,
      clientAddress: order.deliveryAddress,
      clientDistrict: order.deliveryDistrict,
      // Datos originales (mantener para compatibilidad)
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      deliveryAddress: order.deliveryAddress,
      deliveryDistrict: order.deliveryDistrict,
      deliveryReference: order.deliveryReference,
      products: order.dataValues.products?.map(product => ({
        name: product.product?.name || product.productName,
        quantity: product.quantity,
        unitPrice: product.price || product.unitPrice,
        price: product.price,
        subtotal: product.subtotal
      })) || [],
      total: order.totalAmount,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentType: order.paymentType,
      orderDate: order.createdAt,
      deliveryDate: order.deliveryDate,
      notes: order.notes,
      createdAt: order.createdAt,
      isGuestOrder: true
    }));

    console.log('🔍 Primer pedido formateado:', JSON.stringify(formattedOrders[0], null, 2));
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
    const order = await GuestOrder.findOne({
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
    const totalOrders = await GuestOrder.count({
      where: { deliveryPersonId }
    });

    const pendingOrders = await GuestOrder.count({
      where: { 
        deliveryPersonId,
        status: 'en_camino'
      }
    });

    const deliveredOrders = await GuestOrder.count({
      where: { 
        deliveryPersonId,
        status: 'entregado'
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await GuestOrder.count({
      where: { 
        deliveryPersonId,
        createdAt: {
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