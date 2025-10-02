const { GuestOrder, Product, GuestOrderProduct, User, Voucher, Vale, Subscription, sequelize } = require('../models');
const { Op } = require('sequelize');
const { generateUniqueAccessToken } = require('../utils/security');

// Crear un nuevo pedido de invitado o cliente frecuente
exports.createGuestOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  const executionId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`🆔 [${executionId}] INICIANDO createGuestOrder`);
    console.log(`🆔 [${executionId}] Datos recibidos en createGuestOrder:`, req.body);
    
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

    // Si es un cliente frecuente (clientId existe) y el método de pago es VALE, crear vales automáticamente
    if (clientId && paymentMethod === 'vale') {
      console.log('Creando vales para cliente frecuente:', clientId);
      
      if (finalProducts && finalProducts.length > 0) {
        // Crear un vale por cada producto en el pedido
        const vouchers = await Promise.all(
          finalProducts.map(async (item) => {
            const product = await Product.findByPk(item.productId);
            if (product) {
              // Establecer fecha de vencimiento (30 días desde hoy)
              const dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + 30);
              
              return await Voucher.create({
                clientId: clientId,
                deliveryPersonId: null, // Se asignará cuando se asigne el pedido
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: parseFloat(item.price || item.unitPrice),
                totalAmount: parseFloat(item.subtotal || (item.price || item.unitPrice) * item.quantity),
                status: 'pending',
                guestOrderId: guestOrder.id,
                dueDate: dueDate,
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

    // Si el método de pago es suscripción, descontar bidones de la suscripción activa del cliente
    if (paymentMethod === 'suscripcion' && clientId && finalProducts && finalProducts.length > 0) {
      console.log(`🎯 [${executionId}] INICIANDO DESCUENTO DE SUSCRIPCIÓN`);
      console.log(`🎯 [${executionId}] Descontando bidones de suscripción para cliente:`, clientId);
      console.log(`🎯 [${executionId}] Método de pago:`, paymentMethod);
      console.log(`🎯 [${executionId}] ClientId:`, clientId);
      console.log(`🎯 [${executionId}] FinalProducts length:`, finalProducts.length);
      
      try {
        // Buscar suscripción activa del cliente
        const activeSubscription = await Subscription.findOne({
          where: {
            clientId: clientId,
            status: 'active',
            remainingBottles: { [Op.gt]: 0 }
          },
          order: [['created_at', 'DESC']],
          transaction
        });

        if (activeSubscription) {
          // Calcular total de BIDONES a descontar (solo productos tipo 'bidon')
          let totalBottlesToUse = 0;
          
          console.log(`🔍 [${executionId}] Productos a procesar para descuento:`, finalProducts);
          
          for (const item of finalProducts) {
            const product = await Product.findByPk(item.productId);
            console.log(`🔍 Procesando item:`, {
              productId: item.productId,
              quantity: item.quantity,
              product: product ? { name: product.name, type: product.type } : 'No encontrado'
            });
            
            if (product && product.type === 'bidon') {
              const quantityToAdd = parseInt(item.quantity);
              totalBottlesToUse += quantityToAdd;
              console.log(`✅ Descontando bidón: ${product.name} x${quantityToAdd} (total acumulado: ${totalBottlesToUse})`);
            } else if (product) {
              console.log(`ℹ️  Producto no es bidón, no se descuenta: ${product.name} (tipo: ${product.type})`);
            } else {
              console.log(`⚠️  Producto no encontrado para ID: ${item.productId}`);
            }
          }
          
          console.log(`Suscripción encontrada: ${activeSubscription.id}, bidones disponibles: ${activeSubscription.remainingBottles}, bidones a usar: ${totalBottlesToUse}`);
          
          if (activeSubscription.remainingBottles >= totalBottlesToUse) {
            const newRemainingBottles = activeSubscription.remainingBottles - totalBottlesToUse;
            const newStatus = newRemainingBottles === 0 ? 'completed' : 'active';
            
            console.log(`🔄 [${executionId}] ANTES del descuento: ${activeSubscription.remainingBottles} bidones`);
            console.log(`🔄 [${executionId}] Descontando: ${totalBottlesToUse} bidones`);
            console.log(`🔄 [${executionId}] DESPUÉS debería quedar: ${newRemainingBottles} bidones`);
            
            await activeSubscription.update({
              remainingBottles: newRemainingBottles,
              status: newStatus
            }, { transaction });
            
            // Verificar que se actualizó correctamente
            await activeSubscription.reload({ transaction });
            console.log(`✅ [${executionId}] CONFIRMACIÓN - Bidones después de actualización: ${activeSubscription.remainingBottles}`);
            
            // Actualizar el pedido con la referencia a la suscripción
            await guestOrder.update({
              subscriptionId: activeSubscription.id
            }, { transaction });
            
            console.log(`✅ Bidones descontados: ${totalBottlesToUse}, restantes: ${newRemainingBottles}, estado: ${newStatus}`);
          } else {
            console.log(`⚠️ No hay suficientes bidones en la suscripción (disponibles: ${activeSubscription.remainingBottles}, necesarios: ${totalBottlesToUse})`);
          }
        } else {
          console.log('⚠️ No se encontró suscripción activa para el cliente');
        }
      } catch (subscriptionError) {
        console.error('Error al procesar suscripción:', subscriptionError);
        // No cancelar la transacción por esto, solo loggear el error
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
          model: GuestOrderProduct,
          as: 'orderProducts',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unitPrice']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Transformar los datos para que coincidan con el formato esperado por el frontend
    const transformedOrder = {
      ...order.toJSON(),
      products: order.orderProducts?.map(orderProduct => ({
        id: orderProduct.id,
        quantity: orderProduct.quantity,
        price: orderProduct.price,
        subtotal: orderProduct.subtotal,
        product: orderProduct.product
      })) || []
    };

    // Remover orderProducts ya que lo hemos transformado a products
    delete transformedOrder.orderProducts;

    res.json({
      success: true,
      data: transformedOrder
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
          model: GuestOrderProduct,
          as: 'orderProducts',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unitPrice']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Transformar los datos para que coincidan con el formato esperado por el frontend
    const transformedOrders = orders.map(order => {
      const transformed = {
        ...order.toJSON(),
        products: order.orderProducts?.map(orderProduct => ({
          id: orderProduct.id,
          quantity: orderProduct.quantity,
          price: orderProduct.price,
          subtotal: orderProduct.subtotal,
          product: orderProduct.product
        })) || []
      };
      
      // Remover orderProducts ya que lo hemos transformado a products
      delete transformed.orderProducts;
      return transformed;
    });

    res.json({
      success: true,
      data: transformedOrders,
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
          model: GuestOrderProduct,
          as: 'orderProducts',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unitPrice']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Transformar los datos para que coincidan con el formato esperado por el frontend
    const transformedOrder = {
      ...order.toJSON(),
      products: order.orderProducts?.map(orderProduct => ({
        id: orderProduct.id,
        quantity: orderProduct.quantity,
        price: orderProduct.price,
        subtotal: orderProduct.subtotal,
        product: orderProduct.product
      })) || []
    };

    // Remover orderProducts ya que lo hemos transformado a products
    delete transformedOrder.orderProducts;

    res.json({
      success: true,
      data: transformedOrder
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

// Actualizar pedido (incluye actualización de productos si se envían)
exports.updateGuestOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      products, // [{ productId, quantity, price, subtotal }]
      subtotal,
      deliveryFee,
      totalAmount,
      ...rest
    } = req.body;

    const order = await GuestOrder.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // 1) Actualizar cabecera del pedido
    const headerUpdate = {
      ...rest,
    };
    if (typeof subtotal !== 'undefined') headerUpdate.subtotal = parseFloat(subtotal) || 0;
    if (typeof deliveryFee !== 'undefined') headerUpdate.deliveryFee = parseFloat(deliveryFee) || 0;
    if (typeof totalAmount !== 'undefined') headerUpdate.totalAmount = parseFloat(totalAmount) || 0;

    await order.update(headerUpdate, { transaction: t });

    // 2) Si vienen productos, reemplazar las filas del pedido
    if (Array.isArray(products)) {
      // Borrar líneas anteriores
      await GuestOrderProduct.destroy({ where: { guestOrderId: id }, transaction: t });

      // Crear nuevas líneas
      const rows = products.map((item) => ({
        guestOrderId: parseInt(id, 10),
        productId: item.productId,
        quantity: parseInt(item.quantity, 10) || 0,
        price: parseFloat(item.price) || 0,
        subtotal: parseFloat(item.subtotal) || ((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 0))
      }));

      if (rows.length > 0) {
        await GuestOrderProduct.bulkCreate(rows, { transaction: t });
      }
    }

    await t.commit();

    // 3) Volver a leer el pedido con productos y transformarlo al formato esperado
    const updated = await GuestOrder.findByPk(id, {
      include: [
        {
          model: GuestOrderProduct,
          as: 'orderProducts',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unitPrice']
            }
          ]
        }
      ]
    });

    const transformed = {
      ...updated.toJSON(),
      products: updated.orderProducts?.map(op => ({
        id: op.id,
        quantity: op.quantity,
        price: op.price,
        subtotal: op.subtotal,
        product: op.product
      })) || []
    };
    delete transformed.orderProducts;

    return res.json({
      success: true,
      message: 'Pedido actualizado',
      data: transformed
    });

  } catch (error) {
    await t.rollback();
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
      status: 'confirmed'
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
