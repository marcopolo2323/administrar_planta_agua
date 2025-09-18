const { GuestOrder, Product, GuestOrderProduct, User, Voucher, Vale, sequelize } = require('../models');
const { generateUniqueAccessToken } = require('../utils/security');

// Crear un nuevo pedido de invitado o cliente frecuente
exports.createGuestOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Datos recibidos en createGuestOrder:', req.body);
    
    // Manejar tanto el formato antiguo como el nuevo
    const {
      // Formato antiguo
      clientName,
      clientPhone,
      clientEmail,
      deliveryAddress,
      deliveryDistrict,
      deliveryReference,
      deliveryNotes,
      items,
      subtotal,
      deliveryFee,
      total,
      status = 'pendiente',
      // Formato nuevo
      customerName,
      customerPhone,
      customerEmail,
      products,
      totalAmount,
      paymentMethod = 'cash',
      clientId // ID del cliente frecuente (si existe)
    } = req.body;

    // Normalizar datos
    const finalCustomerName = customerName || clientName;
    const finalCustomerPhone = customerPhone || clientPhone;
    const finalCustomerEmail = customerEmail || clientEmail;
    const finalProducts = products || items;
    const finalTotal = totalAmount || total;
    const finalDeliveryFee = deliveryFee || 0;

    // Validar datos requeridos
    if (!finalCustomerName || !finalCustomerPhone || !deliveryAddress || !deliveryDistrict) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Datos requeridos faltantes'
      });
    }

    // Para pedidos normales, validar que haya productos
    if (!clientId && (!finalProducts || finalProducts.length === 0)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe seleccionar al menos un producto'
      });
    }

    // Calcular totales
    const calculatedSubtotal = finalProducts ? 
      finalProducts.reduce((sum, item) => sum + (parseFloat(item.subtotal || (item.price || item.unitPrice) * item.quantity)), 0) : 
      finalTotal;
    const calculatedDeliveryFee = finalDeliveryFee;
    const calculatedTotalAmount = calculatedSubtotal + calculatedDeliveryFee;

    console.log('Creando pedido con datos:', {
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      customerEmail: finalCustomerEmail,
      deliveryAddress,
      deliveryDistrict,
      deliveryNotes: deliveryNotes || deliveryReference,
      totalAmount: calculatedTotalAmount,
      subtotal: calculatedSubtotal,
      deliveryFee: calculatedDeliveryFee,
      status: 'pending',
      paymentMethod: paymentMethod,
      paymentType: req.body.paymentType || 'cash',
      paymentStatus: paymentMethod === 'voucher' ? 'pending' : 'pending',
      clientId: clientId || null,
      subscriptionId: req.body.subscriptionId || null
    });

    // Crear el pedido
    const guestOrder = await GuestOrder.create({
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      customerEmail: finalCustomerEmail,
      deliveryAddress,
      deliveryDistrict,
      deliveryNotes: deliveryNotes || deliveryReference,
      totalAmount: calculatedTotalAmount,
      subtotal: calculatedSubtotal,
      deliveryFee: calculatedDeliveryFee,
      status: 'pending',
      paymentMethod: paymentMethod,
      paymentType: req.body.paymentType || 'cash',
      paymentStatus: paymentMethod === 'voucher' ? 'pending' : 'pending',
      clientId: clientId || null,
      subscriptionId: req.body.subscriptionId || null
    }, { transaction });
    
    // Generar token de acceso único para el pedido
    const accessToken = await generateUniqueAccessToken(GuestOrder);
    await guestOrder.update({ accessToken }, { transaction });
    
    console.log('Pedido creado con ID:', guestOrder.id, 'y token:', accessToken);

    // Crear los productos del pedido
    let orderProducts = [];
    if (finalProducts && finalProducts.length > 0) {
      console.log('Creando productos del pedido...');
      orderProducts = await Promise.all(
        finalProducts.map(async (item) => {
          console.log('Creando producto:', item);
          return await GuestOrderProduct.create({
            guestOrderId: guestOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price || item.unitPrice),
            subtotal: parseFloat(item.subtotal || (item.price || item.unitPrice) * item.quantity)
          }, { transaction });
        })
      );
      console.log('Productos del pedido creados:', orderProducts.length);
    }

    // Si es un cliente frecuente (clientId existe), crear vales automáticamente
    if (clientId) {
      console.log('Creando vales para cliente frecuente:', clientId);
      
      if (finalProducts && finalProducts.length > 0) {
        // Crear un vale por cada producto en el pedido
        const vouchers = await Promise.all(
          finalProducts.map(async (item) => {
            const product = await Product.findByPk(item.productId);
            if (product) {
              return await Voucher.create({
                clientId: clientId,
                deliveryPersonId: null, // Se asignará cuando se asigne el pedido
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: parseFloat(item.price || item.unitPrice),
                totalPrice: parseFloat(item.subtotal || (item.price || item.unitPrice) * item.quantity),
                status: 'pending',
                guestOrderId: guestOrder.id,
                notes: `Vale generado automáticamente para pedido #${guestOrder.id}`
              }, { transaction });
            }
            return null;
          })
        );
        
        // Filtrar vales nulos
        const validVouchers = vouchers.filter(v => v !== null);
        console.log('Vales creados:', validVouchers.length);
      }
    }

    // Confirmar la transacción
    await transaction.commit();
    console.log('✅ Transacción confirmada exitosamente');

    // Obtener el pedido completo con productos para la respuesta
    const completeOrder = await GuestOrder.findByPk(guestOrder.id, {
      include: [
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['quantity', 'price', 'subtotal']
          }
        }
      ]
    });

    console.log('Pedido completo creado:', completeOrder);

    res.json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: {
        order: completeOrder,
        accessToken: accessToken
      }
    });

  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener pedido por token de acceso
exports.getGuestOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const order = await GuestOrder.findOne({
      where: { accessToken: token },
      include: [
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['quantity', 'price', 'subtotal']
          }
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los pedidos (para admin)
exports.getGuestOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, clientId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (clientId) whereClause.clientId = clientId;

    const { count, rows: orders } = await GuestOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['quantity', 'price', 'subtotal']
          }
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener pedido por ID
exports.getGuestOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await GuestOrder.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['quantity', 'price', 'subtotal']
          }
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de pedidos
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await GuestOrder.count();
    const pendingOrders = await GuestOrder.count({ where: { status: 'pending' } });
    const completedOrders = await GuestOrder.count({ where: { status: 'delivered' } });
    const cancelledOrders = await GuestOrder.count({ where: { status: 'cancelled' } });

    res.json({
      success: true,
      data: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar pedido
exports.updateGuestOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order = await GuestOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    await order.update(updateData);

    res.json({
      success: true,
      message: 'Pedido actualizado',
      data: order
    });

  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar estado del pedido
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryPersonId, notes } = req.body;

    const order = await GuestOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    await order.update({
      status,
      deliveryPersonId,
      notes
    });

    res.json({
      success: true,
      message: 'Estado del pedido actualizado',
      data: order
    });

  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Asignar repartidor
exports.assignDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;

    const order = await GuestOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    await order.update({
      deliveryPersonId,
      status: 'assigned'
    });

    res.json({
      success: true,
      message: 'Repartidor asignado',
      data: order
    });

  } catch (error) {
    console.error('Error al asignar repartidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar pedido
exports.deleteGuestOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await GuestOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    await order.destroy();

    res.json({
      success: true,
      message: 'Pedido eliminado'
    });

  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
