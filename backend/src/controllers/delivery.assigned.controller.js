const { GuestOrder, GuestOrderProduct, Product, District, DeliveryFee, Order, OrderDetail, Client, DeliveryPerson } = require('../models');
const { Op } = require('sequelize');

// Obtener pedidos asignados al repartidor autenticado (tanto regulares como de invitados)
exports.getAssignedOrders = async (req, res) => {
  try {
    const userId = req.userId; // ID del usuario autenticado
    const { status } = req.query;

    console.log('🔍 Buscando pedidos para usuario ID:', userId);

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
    console.log('📋 Repartidor encontrado con ID:', deliveryPersonId);

    // Construir filtros para ambos tipos de pedidos
    const guestOrderWhere = {
      deliveryPersonId: deliveryPersonId
    };
    
    const regularOrderWhere = {
      deliveryPersonId: deliveryPersonId
    };

    // Filtrar por estado si se proporciona
    if (status && status !== 'all') {
      guestOrderWhere.status = status;
      regularOrderWhere.status = status;
    }

    // Obtener pedidos de invitados
    const guestOrders = await GuestOrder.findAll({
      where: guestOrderWhere,
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

    // Obtener pedidos regulares
    const regularOrders = await Order.findAll({
      where: regularOrderWhere,
      include: [
        {
          model: OrderDetail,
          as: 'orderDetails',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'description', 'image']
            }
          ]
        },
        {
          model: Client,
          attributes: ['id', 'name', 'phone', 'address', 'district']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('📦 Pedidos de invitados encontrados:', guestOrders.length);
    console.log('📦 Pedidos regulares encontrados:', regularOrders.length);

    // Formatear pedidos de invitados
    const formattedGuestOrders = guestOrders.map(order => ({
      id: order.id,
      type: 'guest',
      orderNumber: `INV-${order.id.toString().padStart(3, '0')}`,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      deliveryAddress: order.deliveryAddress,
      deliveryDistrict: order.deliveryDistrict,
      deliveryReference: order.deliveryReference,
      deliveryNotes: order.deliveryNotes,
      products: order.products?.map(item => ({
        name: item.product?.name || 'Producto no encontrado',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal
      })) || [],
      subtotal: parseFloat(order.subtotal || 0),
      deliveryFee: parseFloat(order.deliveryFee || 0),
      totalAmount: parseFloat(order.totalAmount || 0),
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    // Formatear pedidos regulares
    const formattedRegularOrders = regularOrders.map(order => ({
      id: order.id,
      type: 'regular',
      orderNumber: `PED-${order.id.toString().padStart(3, '0')}`,
      customerName: order.Client?.name || 'Cliente no encontrado',
      customerPhone: order.Client?.phone || '',
      customerEmail: order.Client?.email || '',
      deliveryAddress: order.Client?.address || order.deliveryAddress,
      deliveryDistrict: order.Client?.district || order.deliveryDistrict,
      deliveryReference: order.deliveryReference,
      deliveryNotes: order.notes,
      products: order.orderDetails?.map(detail => ({
        name: detail.product?.name || 'Producto no encontrado',
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal
      })) || [],
      subtotal: parseFloat(order.subtotal || 0),
      deliveryFee: parseFloat(order.deliveryFee || 0),
      totalAmount: parseFloat(order.total || 0),
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    // Combinar y ordenar todos los pedidos
    const allOrders = [...formattedGuestOrders, ...formattedRegularOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log('📋 Total de pedidos combinados:', allOrders.length);

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

    // Estadísticas de pedidos regulares
    const regularTotalOrders = await Order.count({ where: whereClause });
    const regularDeliveredOrders = await Order.count({ 
      where: { ...whereClause, status: 'entregado' } 
    });
    const regularPendingOrders = await Order.count({ 
      where: { 
        ...whereClause, 
        status: { [Op.in]: ['confirmado', 'en_preparacion', 'en_camino'] } 
      } 
    });

    // Totales combinados
    const totalOrders = guestTotalOrders + regularTotalOrders;
    const deliveredOrders = guestDeliveredOrders + regularDeliveredOrders;
    const pendingOrders = guestPendingOrders + regularPendingOrders;

    // Calcular total de entregas
    const guestOrders = await GuestOrder.findAll({
      where: { ...whereClause, status: 'delivered' },
      attributes: ['totalAmount']
    });
    
    const regularOrders = await Order.findAll({
      where: { ...whereClause, status: 'entregado' },
      attributes: ['total']
    });
    
    const guestTotalDeliveries = guestOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
    const regularTotalDeliveries = regularOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const totalDeliveries = guestTotalDeliveries + regularTotalDeliveries;

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
        },
        regularOrders: {
          total: regularTotalOrders,
          delivered: regularDeliveredOrders,
          pending: regularPendingOrders
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
