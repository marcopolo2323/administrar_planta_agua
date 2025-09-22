const { GuestOrder, GuestOrderProduct, Product, District, DeliveryFee, Client, User } = require('../models');
const { Op } = require('sequelize');

// Obtener pedidos asignados al repartidor autenticado (tanto regulares como de invitados)
exports.getAssignedOrders = async (req, res) => {
  try {
    const userId = req.userId; // ID del usuario autenticado
    const { status } = req.query;

    console.log('🔍 Buscando pedidos para usuario ID:', userId);

    // Verificar que el usuario es un repartidor
    const user = await User.findByPk(userId);
    
    if (!user || user.role !== 'repartidor') {
      return res.status(404).json({
        success: false,
        message: 'Usuario no es un repartidor'
      });
    }

    console.log('📋 Repartidor encontrado:', user.username);

    // Construir filtros para pedidos de invitados
    const guestOrderWhere = {
      deliveryPersonId: userId
    };

    // Filtrar por estado si se proporciona
    if (status && status !== 'all') {
      guestOrderWhere.status = status;
    }

    // Obtener pedidos de invitados
    const guestOrders = await GuestOrder.findAll({
      where: guestOrderWhere,
      include: [
        {
          model: GuestOrderProduct,
          as: 'orderProducts',
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

    console.log('📦 Pedidos de invitados encontrados:', guestOrders.length);
    if (guestOrders.length > 0) {
      console.log('🔍 Primer pedido completo:', JSON.stringify(guestOrders[0], null, 2));
    }

    // Formatear pedidos de invitados
    const formattedGuestOrders = guestOrders.map(order => ({
      id: order.id,
      type: 'guest',
      orderNumber: `PED-${order.id.toString().padStart(3, '0')}`,
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
      deliveryNotes: order.deliveryNotes,
      products: order.orderProducts?.map(item => ({
        name: item.product?.name || 'Producto no encontrado',
        productName: item.product?.name || 'Producto no encontrado',
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice || item.price || 0),
        price: parseFloat(item.price || item.unitPrice || 0),
        subtotal: parseFloat(item.subtotal || 0)
      })) || [],
      subtotal: parseFloat(order.subtotal || 0),
      deliveryFee: parseFloat(order.deliveryFee || 0),
      totalAmount: parseFloat(order.totalAmount || 0),
      total: parseFloat(order.totalAmount || 0),
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentType: order.paymentType,
      paymentReference: order.paymentReference,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    // Ordenar pedidos de invitados
    const allOrders = formattedGuestOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log('📋 Total de pedidos:', allOrders.length);
    if (allOrders.length > 0) {
      console.log('🔍 Primer pedido formateado:', JSON.stringify(allOrders[0], null, 2));
    }

    res.json({
      success: true,
      data: allOrders
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
          as: 'orderProducts',
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

// Actualizar estado de un pedido (solo repartidor asignado) - maneja ambos tipos
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, orderType } = req.body;
    const userId = req.userId;

    console.log('🔄 Actualizando estado del pedido:', { id, status, orderType, userId });

    // Buscar el repartidor asociado al usuario
    const deliveryPerson = await DeliveryPerson.findOne({
      where: { userId: userId }
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: 'Repartidor no encontrado para este usuario'
      });
    }

    const deliveryPersonId = deliveryPerson.id;

    // Estados permitidos para repartidores
    const allowedStatuses = ['confirmado', 'en_preparacion', 'en_camino', 'entregado', 'preparing', 'ready', 'delivered'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido para repartidores'
      });
    }

    let order = null;

    // Determinar el tipo de pedido y actualizar en consecuencia
    if (orderType === 'guest' || !orderType) {
      // Buscar primero en pedidos de invitados
      order = await GuestOrder.findOne({
        where: {
          id: id,
          deliveryPersonId: deliveryPersonId
        }
      });

      if (order) {
        await order.update({ status });
        console.log('✅ Pedido de invitado actualizado');
      }
    }

    if (!order) {
      // Si no se encontró en pedidos de invitados, buscar en pedidos regulares
      order = await Order.findOne({
        where: {
          id: id,
          deliveryPersonId: deliveryPersonId
        }
      });

      if (order) {
        await order.update({ status });
        console.log('✅ Pedido regular actualizado');
      }
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado o no asignado a este repartidor'
      });
    }

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

// Obtener estadísticas del repartidor (incluye ambos tipos de pedidos)
exports.getDeliveryStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    // Buscar el repartidor asociado al usuario
    const deliveryPerson = await DeliveryPerson.findOne({
      where: { userId: userId }
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: 'Repartidor no encontrado para este usuario'
      });
    }

    const deliveryPersonId = deliveryPerson.id;

    const whereClause = {
      deliveryPersonId: deliveryPersonId
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Estadísticas de pedidos de invitados
    const guestTotalOrders = await GuestOrder.count({ where: whereClause });
    const guestDeliveredOrders = await GuestOrder.count({ 
      where: { ...whereClause, status: 'delivered' } 
    });
    const guestPendingOrders = await GuestOrder.count({ 
      where: { 
        ...whereClause, 
        status: { [Op.in]: ['confirmed', 'preparing', 'ready'] } 
      } 
    });

    // Totales (solo pedidos de invitados)
    const totalOrders = guestTotalOrders;
    const deliveredOrders = guestDeliveredOrders;
    const pendingOrders = guestPendingOrders;

    // Calcular total de entregas
    const guestOrders = await GuestOrder.findAll({
      where: { ...whereClause, status: 'delivered' },
      attributes: ['totalAmount']
    });
    
    const totalDeliveries = guestOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        deliveredOrders,
        pendingOrders,
        totalDeliveries,
        deliveryRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
        guestOrders: {
          total: guestTotalOrders,
          delivered: guestDeliveredOrders,
          pending: guestPendingOrders
        }
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
