const { GuestOrder, Product, GuestOrderProduct, User, Voucher, Vale } = require('../models');
const { generateUniqueAccessToken } = require('../utils/security');

// Crear un nuevo pedido de invitado o cliente frecuente
exports.createGuestOrder = async (req, res) => {
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
      return res.status(400).json({
        success: false,
        message: 'Datos requeridos faltantes'
      });
    }

    // Para pedidos normales, validar que haya productos
    if (paymentMethod !== 'suscripcion' && (!finalProducts || !Array.isArray(finalProducts) || finalProducts.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Debe seleccionar al menos un producto'
      });
    }

    // Calcular subtotal
    const calculatedTotalAmount = parseFloat(finalTotal);
    const calculatedDeliveryFee = parseFloat(finalDeliveryFee);
    const calculatedSubtotal = calculatedTotalAmount - calculatedDeliveryFee;
    
    // Crear el pedido
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
      paymentStatus: paymentMethod === 'voucher' ? 'pending' : 'pending',
      clientId
    });
    
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
    });
    
    // Generar token de acceso único para el pedido
    const accessToken = await generateUniqueAccessToken(GuestOrder);
    await guestOrder.update({ accessToken });
    
    console.log('Pedido creado con ID:', guestOrder.id, 'y token:', accessToken);

    // Crear los productos del pedido
    let orderProducts = [];
    try {
      // Primero eliminar productos existentes para este pedido (por si hay duplicados)
      await GuestOrderProduct.destroy({
        where: { guestOrderId: guestOrder.id }
      });
      
      orderProducts = await Promise.all(
        finalProducts.map(async (item) => {
          return await GuestOrderProduct.create({
            guestOrderId: guestOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price || item.unitPrice),
            subtotal: parseFloat(item.subtotal || (item.price || item.unitPrice) * item.quantity)
          });
        })
      );
      console.log('Productos del pedido creados:', orderProducts.length);
    } catch (productError) {
      console.warn('⚠️ Error al crear productos del pedido (continuando):', productError.message);
      // Continuar sin productos si hay error
    }

    // Si es un cliente frecuente (clientId existe), crear vales automáticamente
    if (clientId) {
      console.log('Creando vales para cliente frecuente:', clientId);
      
      try {
        // Solo crear vales si hay productos en el pedido
        if (finalProducts && finalProducts.length > 0) {
          // Primero eliminar vales existentes para este pedido (por si hay duplicados)
          await Voucher.destroy({
            where: { guestOrderId: guestOrder.id }
          });
          
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
                  totalAmount: parseFloat(item.subtotal || (item.price || item.unitPrice) * item.quantity),
                  status: 'pending',
                  notes: `Vale generado automáticamente para pedido #${guestOrder.id}`,
                  guestOrderId: guestOrder.id
                });
              }
              return null;
            })
          );

          console.log('Vales creados:', vouchers.filter(v => v !== null).length);
        } else {
          console.log('No hay productos para crear vales');
        }
      } catch (voucherError) {
        console.warn('⚠️ Error al crear vales (continuando sin vales):', voucherError.message);
        // Continuar sin crear vales si hay error
      }
    }

    // Si el método de pago es 'vale', crear un vale en la tabla Vales
    if (paymentMethod === 'vale') {
      console.log('Creando vale para pedido con modalidad vale:', guestOrder.id);
      
      try {
        const vale = await Vale.create({
          clientId: clientId || null,
          amount: calculatedTotalAmount,
          description: `Vale generado para pedido #${guestOrder.id}`,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde hoy
          status: 'active'
        });
        
        console.log('Vale creado con ID:', vale.id);
      } catch (valeError) {
        console.error('Error al crear vale:', valeError);
        // No fallar el pedido si no se puede crear el vale
      }
    }

    // Obtener el pedido completo con productos
    const completeOrder = await GuestOrder.findByPk(guestOrder.id, {
      include: [
        {
          model: GuestOrderProduct,
          as: 'products',
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

    console.log('Pedido completo creado:', completeOrder);

    // Generar boleta automáticamente para todos los pedidos de invitados (fuera de la transacción)
    console.log(`🔄 Programando generación automática de boleta para pedido de invitado #${completeOrder.id}`);
    
    // Usar setImmediate para ejecutar después de que termine la respuesta
    setImmediate(async () => {
      try {
        console.log(`🚀 Iniciando generación de boleta para pedido de invitado #${completeOrder.id}`);
        const { documentGeneratorService } = require('../services/documentGenerator.service');
        
        // Preparar los datos para el PDF
        const orderData = {
          id: completeOrder.id,
          customerName: completeOrder.customerName,
          customerPhone: completeOrder.customerPhone,
          customerEmail: completeOrder.customerEmail,
          deliveryAddress: completeOrder.deliveryAddress,
          deliveryDistrict: completeOrder.deliveryDistrict,
          total: parseFloat(completeOrder.totalAmount),
          subtotal: parseFloat(completeOrder.subtotal),
          deliveryFee: parseFloat(completeOrder.deliveryFee || 0),
          paymentMethod: completeOrder.paymentMethod,
          orderDetails: completeOrder.products.map(item => ({
            productName: item.product?.name || 'Producto',
            quantity: item.quantity,
            unitPrice: parseFloat(item.price),
            subtotal: parseFloat(item.subtotal)
          }))
        };
        
        console.log(`📋 Datos del pedido de invitado #${completeOrder.id}:`, {
          customerName: completeOrder.customerName,
          total: completeOrder.totalAmount,
          productsCount: completeOrder.products?.length || 0,
          orderDetails: orderData.orderDetails
        });
        
        const pdfPath = await documentGeneratorService.generateDocumentPDF(orderData, 'boleta');
        console.log(`✅ Boleta generada automáticamente para el pedido de invitado #${completeOrder.id}: ${pdfPath}`);
      } catch (pdfError) {
        console.error('❌ Error al generar boleta automáticamente para pedido de invitado:', pdfError);
        console.error('Detalles del error:', pdfError.message);
        console.error('Stack trace:', pdfError.stack);
      }
    });
    
    res.status(201).json({
      success: true,
      data: completeOrder,
      accessToken: accessToken,
      message: clientId ? 'Pedido creado y vales generados automáticamente' : 'Pedido creado correctamente'
    });
  } catch (error) {
    console.error('Error al crear pedido de invitado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los pedidos de invitados
exports.getGuestOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const orders = await GuestOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: GuestOrderProduct,
          as: 'products',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unitPrice']
            }
          ]
        },
        {
          model: User,
          as: 'deliveryPerson',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: orders.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.count,
        pages: Math.ceil(orders.count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener pedidos de invitados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener un pedido específico por ID (requiere autenticación)
exports.getGuestOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await GuestOrder.findByPk(id, {
      include: [
        {
          model: GuestOrderProduct,
          as: 'products',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unitPrice']
            }
          ]
        },
        {
          model: User,
          as: 'deliveryPerson',
          attributes: ['id', 'username', 'email'],
          required: false
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
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener un pedido específico por token de acceso (ruta pública segura)
exports.getGuestOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }
    
    const order = await GuestOrder.findOne({
      where: { accessToken: token },
      include: [
        {
          model: GuestOrderProduct,
          as: 'products',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'unitPrice']
            }
          ]
        },
        {
          model: User,
          as: 'deliveryPerson',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado o token inválido'
      });
    }

    console.log('🔍 Pedido encontrado:', {
      id: order.id,
      productsCount: order.products?.length || 0,
      products: order.products?.map(p => ({
        id: p.id,
        productId: p.productId,
        quantity: p.quantity,
        price: p.price,
        productName: p.product?.name
      })) || []
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error al obtener pedido por token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar estado de pedido
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const order = await GuestOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    await order.update({ status });

    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: order
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
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
      message: 'Pedido eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Asignar repartidor a un pedido
exports.assignDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;

    if (!deliveryPersonId) {
      return res.status(400).json({
        success: false,
        message: 'ID del repartidor requerido'
      });
    }

    const order = await GuestOrder.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Actualizar el pedido con el repartidor asignado
    await order.update({ 
      deliveryPersonId,
      status: 'confirmed' // Cambiar estado a confirmado cuando se asigna repartidor
    });

    res.json({
      success: true,
      message: 'Repartidor asignado correctamente',
      data: order
    });
  } catch (error) {
    console.error('Error al asignar repartidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de pedidos
exports.getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const totalOrders = await GuestOrder.count({ where: whereClause });
    const pendingOrders = await GuestOrder.count({ 
      where: { ...whereClause, status: 'pending' } 
    });
    const completedOrders = await GuestOrder.count({ 
      where: { ...whereClause, status: 'delivered' } 
    });
    const cancelledOrders = await GuestOrder.count({ 
      where: { ...whereClause, status: 'cancelled' } 
    });

    // Calcular total de ventas
    const orders = await GuestOrder.findAll({
      where: whereClause,
      attributes: ['totalAmount']
    });
    
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalSales,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar un pedido de invitado
exports.updateGuestOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('🔍 updateGuestOrder - Iniciando actualización:');
    console.log('🔍 ID del pedido:', id);
    console.log('🔍 Datos de actualización:', updateData);
    console.log('🔍 Headers de autorización:', req.headers.authorization);

    // Buscar el pedido
    const guestOrder = await GuestOrder.findByPk(id);
    if (!guestOrder) {
      return res.status(404).json({
        success: false,
        message: 'Pedido de invitado no encontrado'
      });
    }

    // Actualizar el pedido
    console.log('🔍 Actualizando pedido en la base de datos...');
    await guestOrder.update(updateData);
    console.log('🔍 Pedido actualizado exitosamente');

    // Obtener el pedido actualizado con sus relaciones
    const updatedOrder = await GuestOrder.findByPk(id, {
      include: [
        {
          model: GuestOrderProduct,
          as: 'products',
          include: [{
            model: Product,
            as: 'product'
          }]
        },
        {
          model: User,
          as: 'DeliveryPerson',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    console.log('🔍 Pedido actualizado con relaciones:', {
      id: updatedOrder.id,
      status: updatedOrder.status,
      deliveryPersonId: updatedOrder.deliveryPersonId,
      deliveryPerson: updatedOrder.DeliveryPerson
    });

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error al actualizar pedido de invitado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar un pedido existente
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
      data: order,
      message: 'Pedido actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};