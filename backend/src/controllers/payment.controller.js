const { Payment, Order, User } = require('../models');
const { sequelize } = require('../models');
const { createNotificationService } = require('./notification.controller');

// Configuración para integración con PayPal (ejemplo)
const paypal = {
  // En un entorno real, estas credenciales vendrían de variables de entorno
  clientId: process.env.PAYPAL_CLIENT_ID || 'PAYPAL_CLIENT_ID',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'PAYPAL_CLIENT_SECRET',
  // Función simulada para crear un pago
  createPayment: async (amount, description, returnUrl, cancelUrl) => {
    // En una implementación real, aquí se llamaría a la API de PayPal
    console.log('Creando pago en PayPal:', { amount, description });
    return {
      id: 'PAY-' + Math.random().toString(36).substring(2, 15),
      status: 'created',
      links: [
        { rel: 'approval_url', href: `${returnUrl}?token=SIMULATED_TOKEN` }
      ]
    };
  },
  // Función simulada para ejecutar un pago
  executePayment: async (paymentId, payerId) => {
    // En una implementación real, aquí se llamaría a la API de PayPal
    console.log('Ejecutando pago en PayPal:', { paymentId, payerId });
    return {
      id: paymentId,
      status: 'completed',
      transactions: [{
        amount: { total: '100.00' }
      }]
    };
  }
};

// Configuración para integración con MercadoPago (ejemplo)
const mercadopago = {
  // En un entorno real, estas credenciales vendrían de variables de entorno
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'MERCADOPAGO_ACCESS_TOKEN',
  // Función simulada para crear un pago
  createPayment: async (amount, description, payer, notificationUrl) => {
    // En una implementación real, aquí se llamaría a la API de MercadoPago
    console.log('Creando pago en MercadoPago:', { amount, description, payer });
    return {
      id: 'MP-' + Math.random().toString(36).substring(2, 15),
      status: 'pending',
      init_point: `https://www.mercadopago.com/checkout?id=SIMULATED_ID`
    };
  }
};

// Crear un nuevo pago
exports.createPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId, paymentMethod, amount, returnUrl, cancelUrl } = req.body;
    
    // Verificar que el pedido existe
    const order = await Order.findByPk(orderId);
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Verificar que el pedido no tenga ya un pago completado
    const existingPayment = await Payment.findOne({
      where: { 
        orderId,
        paymentStatus: 'completado'
      }
    });
    
    if (existingPayment) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Este pedido ya tiene un pago completado' });
    }
    
    // Crear registro de pago en la base de datos
    const payment = await Payment.create({
      orderId,
      amount,
      paymentMethod,
      paymentStatus: 'pendiente',
      userId: req.userId,
      paymentDate: new Date()
    }, { transaction });
    
    let paymentResponse;
    let redirectUrl;
    
    // Procesar el pago según el método seleccionado
    switch (paymentMethod) {
      case 'paypal':
        paymentResponse = await paypal.createPayment(
          amount,
          `Pago del pedido #${orderId}`,
          returnUrl,
          cancelUrl
        );
        
        // Actualizar el registro de pago con la información de PayPal
        await payment.update({
          transactionId: paymentResponse.id,
          paymentStatus: 'procesando',
          paymentDetails: paymentResponse
        }, { transaction });
        
        // Obtener la URL de redirección para el pago
        redirectUrl = paymentResponse.links.find(link => link.rel === 'approval_url').href;
        break;
        
      case 'mercadopago':
        paymentResponse = await mercadopago.createPayment(
          amount,
          `Pago del pedido #${orderId}`,
          {
            email: req.body.email || 'cliente@example.com'
          },
          `${req.protocol}://${req.get('host')}/api/payments/webhook/mercadopago`
        );
        
        // Actualizar el registro de pago con la información de MercadoPago
        await payment.update({
          transactionId: paymentResponse.id,
          paymentStatus: 'procesando',
          paymentDetails: paymentResponse
        }, { transaction });
        
        // Obtener la URL de redirección para el pago
        redirectUrl = paymentResponse.init_point;
        break;
        
      case 'efectivo':
        // Para pagos en efectivo, se marca como pendiente hasta confirmación manual
        await payment.update({
          paymentStatus: 'pendiente',
          paymentDetails: { message: 'Pago en efectivo pendiente de confirmación' }
        }, { transaction });
        
        // No hay redirección para pagos en efectivo
        redirectUrl = null;
        break;
        
      default:
        await transaction.rollback();
        return res.status(400).json({ message: 'Método de pago no soportado' });
    }
    
    // Actualizar el estado de pago del pedido
    await order.update({
      paymentStatus: payment.paymentStatus
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(201).json({
      payment: {
        id: payment.id,
        status: payment.paymentStatus,
        transactionId: payment.transactionId
      },
      redirectUrl
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear pago:', error);
    return res.status(500).json({ message: 'Error al procesar el pago', error: error.message });
  }
};

// Confirmar pago de PayPal
exports.confirmPayPalPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { paymentId, PayerID } = req.query;
    
    // Buscar el pago en nuestra base de datos
    const payment = await Payment.findOne({
      where: { transactionId: paymentId }
    });
    
    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    
    // Ejecutar el pago en PayPal
    const paypalResponse = await paypal.executePayment(paymentId, PayerID);
    
    // Actualizar el estado del pago en nuestra base de datos
    await payment.update({
      paymentStatus: paypalResponse.status === 'completed' ? 'completado' : 'fallido',
      paymentDetails: { ...payment.paymentDetails, execution: paypalResponse }
    }, { transaction });
    
    // Actualizar el estado de pago del pedido
    const order = await Order.findByPk(payment.orderId);
    await order.update({
      paymentStatus: payment.paymentStatus
    }, { transaction });
    
    await transaction.commit();
    
    // Crear notificación sobre el pago
    try {
      // Notificación para el cliente
      await createNotificationService({
        userId: order.clientId,
        userModel: 'Client',
        title: `Pago procesado para pedido #${order.id}`,
        message: `Tu pago para el pedido #${order.id} ha sido procesado correctamente.`,
        type: 'payment_update',
        orderId: order.id
      });
      
      // Notificación para administradores
      const admins = await User.findAll({
        where: { role: 'admin' },
        attributes: ['id']
      });
      
      if (admins.length > 0) {
        for (const admin of admins) {
          await createNotificationService({
            userId: admin.id,
            userModel: 'User',
            title: `Pago recibido para pedido #${order.id}`,
            message: `Se ha recibido un pago para el pedido #${order.id} por un total de $${order.total.toFixed(2)}.`,
            type: 'payment_update',
            orderId: order.id
          });
        }
      }
    } catch (notificationError) {
      console.error('Error al crear notificaciones de pago:', notificationError);
      // No afecta la respuesta principal
    }
    
    // Redirigir al usuario a una página de confirmación
    return res.redirect(`/payment-confirmation?status=${payment.paymentStatus}`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al confirmar pago de PayPal:', error);
    return res.status(500).json({ message: 'Error al confirmar el pago', error: error.message });
  }
};

// Webhook para notificaciones de MercadoPago
exports.mercadoPagoWebhook = async (req, res) => {
  try {
    const { data } = req.body;
    
    // En una implementación real, aquí se verificaría la autenticidad de la notificación
    // y se procesaría según el tipo de evento
    
    console.log('Notificación recibida de MercadoPago:', data);
    
    // Simular procesamiento de la notificación
    if (data && data.id) {
      // Buscar el pago en nuestra base de datos por el ID de transacción
      const payment = await Payment.findOne({
        where: { transactionId: data.id }
      });
      
      if (payment) {
        // Actualizar el estado del pago según la notificación
        await payment.update({
          paymentStatus: 'completado', // En una implementación real, esto dependería del estado en la notificación
          paymentDetails: { ...payment.paymentDetails, webhook: data }
        });
        
        // Actualizar el estado de pago del pedido
        const order = await Order.findByPk(payment.orderId);
        await order.update({
          paymentStatus: payment.paymentStatus
        });
        
        // Crear notificaciones sobre la actualización del pago
        try {
          // Notificación para el cliente
          await createNotificationService({
            userId: order.clientId,
            userModel: 'Client',
            title: `Actualización de pago para pedido #${order.id}`,
            message: `El estado de pago de tu pedido #${order.id} ha sido actualizado a: ${payment.paymentStatus}.`,
            type: 'payment_update',
            orderId: order.id
          });
          
          // Notificación para administradores
          const admins = await User.findAll({
            where: { role: 'admin' },
            attributes: ['id']
          });
          
          if (admins.length > 0) {
            for (const admin of admins) {
              await createNotificationService({
                userId: admin.id,
                userModel: 'User',
                title: `Actualización de pago para pedido #${order.id}`,
                message: `El estado de pago del pedido #${order.id} ha sido actualizado a: ${payment.paymentStatus}.`,
                type: 'payment_update',
                orderId: order.id
              });
            }
          }
        } catch (notificationError) {
          console.error('Error al crear notificaciones de actualización de pago:', notificationError);
          // No afecta la respuesta principal
        }
      }
    }
    
    // MercadoPago espera un código 200 como respuesta a las notificaciones
    return res.status(200).send('OK');
    
  } catch (error) {
    console.error('Error al procesar webhook de MercadoPago:', error);
    return res.status(500).json({ message: 'Error al procesar la notificación', error: error.message });
  }
};

// Obtener todos los pagos (solo para administradores)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: Order, include: ['clientId'] },
        { model: User, attributes: ['id', 'username', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json(payments);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return res.status(500).json({ message: 'Error al obtener los pagos', error: error.message });
  }
};

// Obtener un pago por ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findByPk(id, {
      include: [
        { model: Order, include: ['clientId'] },
        { model: User, attributes: ['id', 'username', 'email'] }
      ]
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    
    return res.status(200).json(payment);
  } catch (error) {
    console.error('Error al obtener pago:', error);
    return res.status(500).json({ message: 'Error al obtener el pago', error: error.message });
  }
};

// Actualizar estado de pago manualmente (para pagos en efectivo o casos especiales)
exports.updatePaymentStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    // Verificar que el estado sea válido
    const validStatuses = ['pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'];
    if (!validStatuses.includes(paymentStatus)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Estado de pago no válido' });
    }
    
    // Buscar el pago
    const payment = await Payment.findByPk(id);
    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    
    // Actualizar el estado del pago
    await payment.update({
      paymentStatus,
      paymentDetails: { 
        ...payment.paymentDetails, 
        manualUpdate: {
          date: new Date(),
          userId: req.userId,
          previousStatus: payment.paymentStatus
        }
      }
    }, { transaction });
    
    // Actualizar el estado de pago del pedido
    const order = await Order.findByPk(payment.orderId);
    await order.update({
      paymentStatus
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      message: 'Estado de pago actualizado correctamente',
      payment: {
        id: payment.id,
        status: payment.paymentStatus,
        orderId: payment.orderId
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar estado de pago:', error);
    return res.status(500).json({ message: 'Error al actualizar el estado del pago', error: error.message });
  }
};

// Obtener pagos por cliente
exports.getPaymentsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const payments = await Payment.findAll({
      include: [
        { 
          model: Order,
          where: { clientId },
          include: ['clientId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json(payments);
  } catch (error) {
    console.error('Error al obtener pagos del cliente:', error);
    return res.status(500).json({ message: 'Error al obtener los pagos del cliente', error: error.message });
  }
};