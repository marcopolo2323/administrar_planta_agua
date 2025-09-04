const { Order, OrderDetail, Product, GuestOrder } = require('../models');
const { sequelize } = require('../models');

// Crear un pedido para un usuario no registrado
exports.createGuestOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { guestName, guestPhone, guestEmail, products, shippingAddress, paymentMethod, deliveryDistrict, deliveryFee } = req.body;
    
    // Validar datos del cliente invitado
    if (!guestName || !guestPhone || !guestEmail) {
      return res.status(400).json({ message: 'Nombre, teléfono y correo son obligatorios' });
    }
    
    // Validar productos
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Debe incluir al menos un producto' });
    }
    
    // Validar dirección de envío y distrito
    if (!shippingAddress) {
      return res.status(400).json({ message: 'La dirección de envío es obligatoria' });
    }

    if (!deliveryDistrict) {
      return res.status(400).json({ message: 'El distrito de entrega es obligatorio' });
    }
    
    // Crear el pedido
    const order = await Order.create({
      orderDate: new Date(),
      status: 'pendiente',
      paymentStatus: 'pendiente',
      paymentMethod: paymentMethod || 'efectivo',
      deliveryAddress: shippingAddress,
      deliveryDistrict: deliveryDistrict,
      contactPhone: guestPhone, // Usamos el teléfono del invitado
      total: 0, // Se calculará después
      deliveryFee: deliveryFee || 0 // Costo de envío según el distrito
    }, { transaction: t });
    
    // Crear el registro de cliente invitado
    const guestOrder = await GuestOrder.create({
      guestName,
      guestPhone,
      guestEmail,
      orderId: order.id
    }, { transaction: t });
    
    // Procesar los productos y calcular el total
    let orderTotal = 0;
    
    for (const item of products) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      
      if (!product) {
        throw new Error(`Producto con ID ${item.productId} no encontrado`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto ${product.name}`);
      }
      
      // Determinar el precio unitario
      let unitPrice = product.unitPrice;
      
      console.log(`Producto: ${product.name}, Tipo: ${product.type}, Precio original: ${unitPrice}, Cantidad: ${item.quantity}`);
      
      // Aplicar descuento para bidones de agua cuando se compran 2 o más
      if ((product.name.toLowerCase().includes('bidon') || product.type === 'bidon') && item.quantity >= 2) {
        unitPrice = 5.00; // Precio especial de 5 soles por bidón
        console.log(`Aplicando precio especial para bidón: ${product.name}, cantidad: ${item.quantity}, precio unitario: ${unitPrice}`);
      }
      
      // Aplicar precio mayorista para paquetes de botellas
      if (product.name.toLowerCase().includes('botella') || product.name.toLowerCase().includes('agua') || product.type === 'botella') {
        if (item.quantity >= 50) {
          unitPrice = 9.00; // Precio especial de 9 soles por paquete cuando compran 50 o más
          console.log(`Aplicando precio especial para paquete: ${product.name}, cantidad: ${item.quantity}, precio unitario: ${unitPrice}`);
        } else if (item.quantity >= (product.wholesaleMinQuantity || 10) && product.wholesalePrice) {
          unitPrice = product.wholesalePrice;
          console.log(`Aplicando precio mayorista para paquete: ${product.name}, cantidad: ${item.quantity}, precio unitario: ${unitPrice}`);
        }
      }
      
      // Crear detalle del pedido
      await OrderDetail.create({
        orderId: order.id,
        productId: product.id,
        quantity: item.quantity,
        unitPrice: unitPrice,
        subtotal: unitPrice * item.quantity
      }, { transaction: t });
      
      // Actualizar stock
      await product.update({
        stock: product.stock - item.quantity
      }, { transaction: t });
      
      // Sumar al total
      orderTotal += unitPrice * item.quantity;
    }
    
    // Actualizar el total del pedido
    await order.update({ total: orderTotal }, { transaction: t });
    
    await t.commit();
    
    return res.status(201).json({
      message: 'Pedido creado exitosamente',
      orderId: order.id,
      trackingInfo: {
        orderId: order.id,
        guestName: guestOrder.guestName
      }
    });
    
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
  }
};

// Obtener un pedido por ID (para seguimiento)
exports.getGuestOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        {
          model: GuestOrder,
          as: 'guestOrder'
        },
        {
          model: OrderDetail,
          as: 'orderDetails',
          include: [{
            model: Product,
            as: 'product'
          }]
        },
        {
          model: sequelize.models.Payment,
          as: 'payment',
          required: false
        }
      ]
    });
    
    if (!order || !order.guestOrder) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    return res.status(200).json(order);
    
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el pedido', error: error.message });
  }
};

// Obtener todos los pedidos de invitados (para admin, vendedor y repartidor)
exports.getAllGuestOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: GuestOrder,
          as: 'guestOrder',
          required: true // Solo pedidos que tengan un registro en GuestOrder
        },
        {
          model: OrderDetail,
          as: 'orderDetails',
          include: [{
            model: Product,
            as: 'product'
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json(orders);
    
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};

// Actualizar el estado de un pedido de invitado
exports.updateGuestOrderStatus = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      await t.rollback();
      return res.status(400).json({ message: 'El estado es requerido' });
    }
    
    // Validar que el estado sea válido
    const validStatuses = ['pendiente', 'en proceso', 'enviado', 'entregado', 'cancelado'];
    if (!validStatuses.includes(status)) {
      await t.rollback();
      return res.status(400).json({ message: 'Estado no válido' });
    }
    
    const order = await Order.findByPk(id, {
      include: [{
        model: GuestOrder,
        as: 'guestOrder'
      }],
      transaction: t
    });
    
    if (!order || !order.guestOrder) {
      await t.rollback();
      return res.status(404).json({ message: 'Pedido de invitado no encontrado' });
    }
    
    // Actualizar estado
    await order.update({ status }, { transaction: t });
    
    await t.commit();
    
    // Obtener la orden actualizada para devolverla en la respuesta
    const updatedOrder = await Order.findByPk(id, {
      include: [{
        model: GuestOrder,
        as: 'guestOrder'
      }]
    });
    
    return res.status(200).json({
      message: 'Estado del pedido actualizado correctamente',
      order: updatedOrder
    });
    
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar estado del pedido:', error);
    return res.status(500).json({ message: 'Error al actualizar el estado del pedido', error: error.message });
  }
};

// Actualizar el estado de pago de un pedido de invitado
exports.updateGuestOrderPaymentStatus = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    if (!paymentStatus) {
      await t.rollback();
      return res.status(400).json({ message: 'El estado de pago es requerido' });
    }
    
    // Validar que el estado de pago sea válido
    const validPaymentStatuses = ['pendiente', 'pagado', 'rechazado'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      await t.rollback();
      return res.status(400).json({ message: 'Estado de pago no válido' });
    }
    
    const order = await Order.findByPk(id, {
      include: [{
        model: GuestOrder,
        as: 'guestOrder'
      }],
      transaction: t
    });
    
    if (!order || !order.guestOrder) {
      await t.rollback();
      return res.status(404).json({ message: 'Pedido de invitado no encontrado' });
    }
    
    // Actualizar estado de pago
    await order.update({ paymentStatus }, { transaction: t });
    
    await t.commit();
    
    // Obtener la orden actualizada para devolverla en la respuesta
    const updatedOrder = await Order.findByPk(id, {
      include: [{
        model: GuestOrder,
        as: 'guestOrder'
      }]
    });
    
    return res.status(200).json({
      message: 'Estado de pago actualizado correctamente',
      order: updatedOrder
    });
    
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar estado de pago:', error);
    return res.status(500).json({ message: 'Error al actualizar el estado de pago', error: error.message });
  }
};

// Asignar repartidor a un pedido de invitado
exports.assignDeliveryPerson = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;
    
    console.log('ID del pedido:', id);
    console.log('ID del repartidor:', deliveryPersonId);
    
    if (!deliveryPersonId) {
      await t.rollback();
      return res.status(400).json({ message: 'El ID del repartidor es obligatorio' });
    }
    
    // Verificar que el pedido existe
    const order = await Order.findByPk(id, {
      include: [{
        model: GuestOrder,
        as: 'guestOrder'
      }],
      transaction: t
    });
    
    if (!order || !order.guestOrder) {
      await t.rollback();
      return res.status(404).json({ message: 'Pedido de invitado no encontrado' });
    }
    
    // Verificar que el repartidor existe y tiene el rol correcto
    const deliveryPerson = await sequelize.models.User.findByPk(deliveryPersonId, { transaction: t });
    if (!deliveryPerson) {
      await t.rollback();
      return res.status(404).json({ message: 'Repartidor no encontrado' });
    }
    
    if (deliveryPerson.role !== 'repartidor') {
      await t.rollback();
      return res.status(400).json({ message: 'El usuario asignado debe tener rol de repartidor' });
    }
    
    // Asignar repartidor
    await order.update({ deliveryPersonId }, { transaction: t });
    
    // Crear notificación para el repartidor asignado si existe el servicio
    try {
      const createNotificationService = require('../services/notification.service');
      
      await createNotificationService({
        userId: deliveryPersonId,
        userModel: 'DeliveryPerson',
        title: 'Nuevo pedido asignado',
        message: `Se te ha asignado el pedido de invitado #${order.id} para entrega en ${order.deliveryAddress}, ${order.deliveryDistrict}.`,
        type: 'delivery_assigned',
        orderId: order.id
      });
    } catch (notificationError) {
      console.error('Error al crear notificaciones de asignación:', notificationError);
      // No afecta la respuesta principal
    }
    
    await t.commit();
    
    return res.status(200).json({
      message: 'Repartidor asignado correctamente',
      order
    });
    
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: 'Error al asignar repartidor', error: error.message });
  }
};