const { Order, OrderDetail, Product, Client, User, sequelize } = require('../models');
const { createNotificationService, createMultipleNotificationsService } = require('./notification.controller');

/**
 * Crear un nuevo pedido a domicilio
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos para la creación del pedido
 * @param {number} req.body.clientId - ID del cliente
 * @param {Array} req.body.products - Lista de productos a pedir
 * @param {string} req.body.deliveryAddress - Dirección de entrega
 * @param {string} req.body.deliveryDistrict - Distrito de entrega
 * @param {string} req.body.contactPhone - Teléfono de contacto
 * @param {string} req.body.paymentMethod - Método de pago
 * @param {string} req.body.notes - Notas adicionales
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Información del pedido creado
 */
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { 
      clientId, 
      products, 
      deliveryAddress, 
      deliveryDistrict, 
      contactPhone, 
      paymentMethod, 
      paymentReference,
      notes 
    } = req.body;
    
    const userId = req.userId; // Obtenido del middleware de autenticación

    // Validar que haya productos
    if (!products || products.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Debe incluir al menos un producto' });
    }
    
    // Calcular el total del pedido
    let total = 0;
    let deliveryFee = 5.00; // Tarifa base de entrega
    
    // Verificar disponibilidad de productos y calcular total
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado` });
      }

      // Verificar stock
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ message: `Stock insuficiente para ${product.name}` });
      }

      // Determinar el precio según la cantidad (mayoreo o unitario)
      let price = product.unitPrice;
      
      console.log(`Producto: ${product.name}, Tipo: ${product.type}, Precio original: ${price}, Cantidad: ${item.quantity}`);
      
      // Aplicar descuento para bidones de agua cuando se compran 2 o más
      if ((product.type === 'bidon' || product.name.toLowerCase().includes('bidon')) && item.quantity >= 2) {
        price = 5.00; // Precio especial de 5 soles por bidón
        console.log(`Aplicando precio especial para bidón: ${product.name}, cantidad: ${item.quantity}, precio unitario: ${price}`);
      }
      
      // Aplicar precio mayorista para paquetes de botellas
      if ((product.type === 'botella' || product.name.toLowerCase().includes('botella') || product.name.toLowerCase().includes('agua')) && 
          item.quantity >= (product.wholesaleMinQuantity || 10) && product.wholesalePrice) {
        price = product.wholesalePrice;
        console.log(`Aplicando precio mayorista para paquete: ${product.name}, cantidad: ${item.quantity}, precio unitario: ${price}`);
      }

      // Calcular subtotal
      const subtotal = price * item.quantity;
      total += subtotal;
    }
    
    // Añadir tarifa de entrega al total
    total += deliveryFee;

    // Verificar que el cliente existe (para clientes frecuentes)
    const client = await Client.findByPk(clientId);
    const isCredit = paymentMethod === 'credito';
    
    // Si el método de pago es crédito, verificar que el cliente exista
    if (isCredit) {
      if (!client) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Cliente no encontrado' });
      }
      
      // Los clientes frecuentes siempre pueden pagar a crédito (con vales)
      console.log(`Cliente ${client.name} (ID: ${clientId}) realizando pedido a crédito con vales`);
    }
    
    // Crear el pedido
    const order = await Order.create({
      clientId,
      userId,
      total,
      deliveryAddress,
      deliveryDistrict,
      contactPhone,
      paymentMethod,
      paymentReference,
      notes,
      status: 'pendiente',
      paymentStatus: isCredit ? 'credito' : (paymentMethod === 'efectivo' ? 'pendiente' : 'pagado'),
      deliveryFee,
      isCredit: isCredit
    }, { transaction });

    // Crear los detalles del pedido
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      
      // Determinar el precio según la cantidad (mayoreo o unitario)
      let price = product.unitPrice;
      if (product.wholesalePrice && product.wholesaleMinQuantity && item.quantity >= product.wholesaleMinQuantity) {
        price = product.wholesalePrice;
      }

      await OrderDetail.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: price,
        subtotal: price * item.quantity
      }, { transaction });
      
      // Reservar el stock (no lo restamos aún hasta confirmar el pedido)
      // Esto se manejará en la confirmación del pedido
    }

    await transaction.commit();

    // Crear notificación para el administrador
    try {
      const admins = await User.findAll({
        where: { role: 'admin' },
        attributes: ['id']
      });

      // Crear notificaciones para todos los administradores
      if (admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
          userId: admin.id,
          userModel: 'User',
          title: 'Nuevo pedido recibido',
          message: `Se ha recibido un nuevo pedido #${order.id} por un total de $${order.total.toFixed(2)}`,
          type: 'new_order',
          orderId: order.id
        }));

        await createMultipleNotificationsService(adminNotifications);
      }

      // Crear notificación para el cliente
      await createNotificationService({
        userId: clientId,
        userModel: 'Client',
        title: 'Pedido realizado con éxito',
        message: `Tu pedido #${order.id} ha sido recibido y está siendo procesado.`,
        type: 'new_order',
        orderId: order.id
      });
    } catch (notificationError) {
      console.error('Error al crear notificaciones:', notificationError);
      // No revertimos la transacción principal, ya que el pedido se creó correctamente
    }

    return res.status(201).json({
      message: 'Pedido registrado correctamente',
      order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear pedido:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Obtener todos los pedidos
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Array} Lista de pedidos
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Client },
        { model: User, as: 'createdBy', attributes: ['id', 'username'] },
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] }
      ],
      order: [['orderDate', 'DESC']]
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Obtener un pedido por ID
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de la solicitud
 * @param {number} req.params.id - ID del pedido
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Información del pedido
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: Client },
        { model: User, as: 'createdBy', attributes: ['id', 'username'] },
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { 
          model: OrderDetail,
          include: [{ model: Product }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Actualizar el estado de un pedido
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de la solicitud
 * @param {number} req.params.id - ID del pedido
 * @param {Object} req.body - Datos para la actualización del pedido
 * @param {string} req.body.status - Nuevo estado del pedido
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Información del pedido actualizado
 */
exports.updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByPk(id, { transaction });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Validar transiciones de estado válidas
    const validTransitions = {
      'pendiente': ['confirmado', 'cancelado'],
      'confirmado': ['en_preparacion', 'cancelado'],
      'en_preparacion': ['en_camino', 'cancelado'],
      'en_camino': ['entregado', 'cancelado'],
      'entregado': [],
      'cancelado': []
    };
    
    if (!validTransitions[order.status].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `No se puede cambiar el estado de '${order.status}' a '${status}'` 
      });
    }
    
    // Si se confirma el pedido, actualizar el stock
    if (status === 'confirmado') {
      const orderDetails = await OrderDetail.findAll({
        where: { orderId: id },
        include: [{ model: Product }],
        transaction
      });
      
      for (const detail of orderDetails) {
        const product = detail.Product;
        
        // Verificar stock nuevamente por si acaso
        if (product.stock < detail.quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: `Stock insuficiente para ${product.name}` 
          });
        }
        
        // Actualizar stock
        await product.update({ 
          stock: product.stock - detail.quantity 
        }, { transaction });
      }
    }
    
    // Si se cancela un pedido confirmado, devolver el stock
    if (status === 'cancelado' && order.status !== 'pendiente') {
      const orderDetails = await OrderDetail.findAll({
        where: { orderId: id },
        include: [{ model: Product }],
        transaction
      });
      
      for (const detail of orderDetails) {
        const product = detail.Product;
        
        // Devolver stock
        await product.update({ 
          stock: product.stock + detail.quantity 
        }, { transaction });
      }
    }
    
    // Actualizar estado del pedido
    await order.update({ status }, { transaction });
    
    await transaction.commit();
    
    // Crear notificación para el cliente sobre el cambio de estado
    try {
      // Obtener mensaje según el estado
      let statusMessage = '';
      switch(status) {
        case 'confirmado':
          statusMessage = 'Tu pedido ha sido confirmado y está siendo procesado.';
          break;
        case 'en_preparacion':
          statusMessage = 'Tu pedido está siendo preparado.';
          break;
        case 'en_camino':
          statusMessage = 'Tu pedido está en camino a tu dirección.';
          break;
        case 'entregado':
          statusMessage = 'Tu pedido ha sido entregado. ¡Gracias por tu compra!';
          break;
        case 'cancelado':
          statusMessage = 'Tu pedido ha sido cancelado.';
          break;
        default:
          statusMessage = `El estado de tu pedido ha cambiado a: ${status}`;
      }

      // Notificación para el cliente
      await createNotificationService({
        userId: order.clientId,
        userModel: 'Client',
        title: `Actualización de tu pedido #${order.id}`,
        message: statusMessage,
        type: 'order_status_update',
        orderId: order.id
      });

      // Notificación para administradores si es un estado importante
      if (['entregado', 'cancelado'].includes(status)) {
        const admins = await User.findAll({
          where: { role: 'admin' },
          attributes: ['id']
        });

        if (admins.length > 0) {
          const adminNotifications = admins.map(admin => ({
            userId: admin.id,
            userModel: 'User',
            title: `Pedido #${order.id} ${status}`,
            message: `El pedido #${order.id} ha sido marcado como ${status}.`,
            type: 'order_status_update',
            orderId: order.id
          }));

          await createMultipleNotificationsService(adminNotifications);
        }
      }

      // Notificación para el repartidor si está asignado y el pedido está en camino
      if (status === 'en_camino' && order.deliveryPersonId) {
        await createNotificationService({
          userId: order.deliveryPersonId,
          userModel: 'DeliveryPerson',
          title: `Pedido #${order.id} en camino`,
          message: `Debes entregar el pedido #${order.id} a la dirección: ${order.deliveryAddress}, ${order.deliveryDistrict}.`,
          type: 'order_status_update',
          orderId: order.id
        });
      }
    } catch (notificationError) {
      console.error('Error al crear notificaciones de estado:', notificationError);
      // No afecta la respuesta principal
    }
    
    return res.status(200).json({
      message: 'Estado del pedido actualizado correctamente',
      order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar estado del pedido:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Asignar un repartidor a un pedido
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de la solicitud
 * @param {number} req.params.id - ID del pedido
 * @param {Object} req.body - Datos para la asignación
 * @param {number} req.body.deliveryPersonId - ID del repartidor
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Información del pedido actualizado
 */
exports.assignDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;
    
    // Verificar que el pedido existe
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Verificar que el repartidor existe y tiene el rol correcto
    const deliveryPerson = await User.findByPk(deliveryPersonId);
    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Repartidor no encontrado' });
    }
    
    if (deliveryPerson.role !== 'repartidor') {
      return res.status(400).json({ message: 'El usuario asignado debe tener rol de repartidor' });
    }
    
    // Asignar repartidor
    await order.update({ deliveryPersonId });
    
    // Crear notificación para el repartidor asignado
    try {
      await createNotificationService({
        userId: deliveryPersonId,
        userModel: 'DeliveryPerson',
        title: 'Nuevo pedido asignado',
        message: `Se te ha asignado el pedido #${order.id} para entrega en ${order.deliveryAddress}, ${order.deliveryDistrict}.`,
        type: 'delivery_assigned',
        orderId: order.id
      });
      
      // Notificar al cliente que se ha asignado un repartidor
      await createNotificationService({
        userId: order.clientId,
        userModel: 'Client',
        title: 'Repartidor asignado a tu pedido',
        message: `Se ha asignado un repartidor a tu pedido #${order.id}. Pronto estará en camino.`,
        type: 'order_status_update',
        orderId: order.id
      });
    } catch (notificationError) {
      console.error('Error al crear notificaciones de asignación:', notificationError);
      // No afecta la respuesta principal
    }
    
    return res.status(200).json({
      message: 'Repartidor asignado correctamente',
      order
    });
  } catch (error) {
    console.error('Error al asignar repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Actualizar el estado de pago de un pedido
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de la solicitud
 * @param {number} req.params.id - ID del pedido
 * @param {Object} req.body - Datos para la actualización
 * @param {string} req.body.paymentStatus - Nuevo estado de pago
 * @param {string} req.body.paymentReference - Referencia de pago (opcional)
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Información del pedido actualizado
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentReference } = req.body;
    
    // Verificar que el pedido existe
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Validar estado de pago
    const validPaymentStatus = ['pendiente', 'pagado', 'reembolsado'];
    if (!validPaymentStatus.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Estado de pago no válido' });
    }
    
    // Actualizar estado de pago
    const updateData = { paymentStatus };
    if (paymentReference) {
      updateData.paymentReference = paymentReference;
    }
    
    await order.update(updateData);
    
    return res.status(200).json({
      message: 'Estado de pago actualizado correctamente',
      order
    });
  } catch (error) {
    console.error('Error al actualizar estado de pago:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Obtener pedidos por cliente
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de la solicitud
 * @param {number} req.params.clientId - ID del cliente
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Array} Lista de pedidos del cliente
 */
exports.getOrdersByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Verificar que el cliente existe
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    // Obtener pedidos del cliente
    const orders = await Order.findAll({
      where: { clientId },
      include: [
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { 
          model: OrderDetail,
          include: [{ model: Product }]
        }
      ],
      order: [['orderDate', 'DESC']]
    });
    
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos del cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Obtener pedidos asignados a un repartidor
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de la solicitud
 * @param {number} req.params.deliveryPersonId - ID del repartidor
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Array} Lista de pedidos asignados al repartidor
 */
exports.getOrdersByDeliveryPerson = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;
    
    // Verificar que el repartidor existe
    const deliveryPerson = await User.findByPk(deliveryPersonId);
    if (!deliveryPerson) {
      return res.status(404).json({ message: 'Repartidor no encontrado' });
    }
    
    // Obtener pedidos asignados al repartidor
    const orders = await Order.findAll({
      where: { deliveryPersonId },
      include: [
        { model: Client },
        { 
          model: OrderDetail,
          include: [{ model: Product }]
        }
      ],
      order: [['orderDate', 'DESC']]
    });
    
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos del repartidor:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};