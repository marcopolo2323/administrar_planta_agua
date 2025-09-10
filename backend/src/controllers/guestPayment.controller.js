const { Order, GuestOrder, Payment } = require('../models');
const { sequelize } = require('../models');
const path = require('path');
const fs = require('fs-extra');
const documentGeneratorService = require('../services/documentGenerator.service');

// Crear directorio para documentos si no existe
const documentsDir = path.join(__dirname, '..', '..', 'documents');
fs.ensureDirSync(documentsDir);

// Crear un pago para un pedido de invitado
exports.createGuestPayment = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { orderId, paymentMethod, documentType, invoiceData, amount: requestAmount, isCredit } = req.body;
    
    // Los invitados no pueden tener crédito
    if (isCredit) {
      return res.status(403).json({ message: 'Los clientes invitados no pueden realizar compras a crédito. Solo los clientes registrados con crédito habilitado tienen esta opción.' });
    }
    
    // Validar datos
    if (!orderId || !paymentMethod || !documentType) {
      return res.status(400).json({ message: 'ID de pedido, método de pago y tipo de documento son obligatorios' });
    }
    
    // Asegurarse de que orderId sea un número
    const orderIdNum = parseInt(orderId, 10);
    if (isNaN(orderIdNum)) {
      return res.status(400).json({ message: 'ID de pedido debe ser un número válido' });
    }
    
    // Validar datos de factura si el tipo de documento es factura
    if (documentType === 'factura' && (!invoiceData || !invoiceData.ruc || !invoiceData.businessName || !invoiceData.address)) {
      return res.status(400).json({ message: 'Datos de facturación incompletos' });
    }
    
    // Verificar que el pedido existe y es de un invitado
    const order = await Order.findOne({
      where: { id: orderIdNum },
      include: [{
        model: GuestOrder,
        as: 'guestOrder'
      }],
      transaction: t
    });
    
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    if (!order.guestOrder) {
      await t.rollback();
      return res.status(400).json({ message: 'Este pedido no corresponde a un cliente invitado' });
    }
    
    // Verificar que el pedido no esté ya pagado
    if (order.paymentStatus === 'pagado') {
      await t.rollback();
      return res.status(400).json({ message: 'Este pedido ya ha sido pagado' });
    }
    
    // Crear el registro de pago
    // Asegurar que el monto sea un número
    let amount;
    try {
      amount = typeof order.total === 'number' ? order.total : parseFloat(order.total || 0);
      if (isNaN(amount)) {
        throw new Error('El monto total no es un número válido');
      }
    } catch (error) {
      await t.rollback();
      return res.status(400).json({ message: 'Error en el monto del pedido', error: error.message });
    }
    
    // Para invitados, siempre es pago completo (nunca crédito)
    const paymentStatus = 'completado';
    const orderPaymentStatus = 'pagado';
    
    const payment = await Payment.create({
      orderId: order.id,
      amount: amount,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      paymentDate: new Date(),
      documentType,
      invoiceData: documentType === 'factura' ? JSON.stringify(invoiceData) : null
    }, { transaction: t });
    
    // Actualizar el estado de pago, el método de pago y el tipo de documento del pedido
    await order.update({
      paymentStatus: orderPaymentStatus,
      paymentMethod: paymentMethod,
      documentType: documentType,
      total: amount, // Asegurar que el total sea un número
      invoiceData: documentType === 'factura' ? JSON.stringify(invoiceData) : null,
      isCredit: false // Los invitados nunca pueden tener crédito
    }, { transaction: t });
    
    // Para invitados no se crea registro de crédito
    
    // Actualizar el objeto order con los nuevos valores
    order.total = amount;
    
    // Generar PDF del documento (boleta o factura)
    try {
      // Asegurarse de que invoiceData sea un objeto si documentType es factura
      const invoiceDataObj = documentType === 'factura' ? 
        (typeof invoiceData === 'string' ? JSON.parse(invoiceData) : invoiceData) : 
        null;
      
      // Obtener los detalles completos del pedido con productos para el PDF
      const orderWithDetails = await Order.findOne({
        where: { id: order.id },
        include: [
          {
            model: sequelize.models.OrderDetail,
            as: 'orderDetails',
            include: [{
              model: sequelize.models.Product,
              as: 'product'
            }]
          },
          {
            model: sequelize.models.GuestOrder,
            as: 'guestOrder'
          }
        ],
        transaction: t
      });
      
      // Preparar los datos para el PDF
      const orderData = {
        ...orderWithDetails.toJSON(),
        items: orderWithDetails.orderDetails.map(detail => ({
          product: detail.product,
          productName: detail.product.name,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          subtotal: detail.subtotal
        })),
        customerName: orderWithDetails.guestOrder.guestName,
        customerPhone: orderWithDetails.guestOrder.guestPhone,
        customerEmail: orderWithDetails.guestOrder.guestEmail,
        // Asegurar que se incluya el distrito y costo de envío
        deliveryDistrict: orderWithDetails.deliveryDistrict || 'No especificado',
        deliveryFee: orderWithDetails.deliveryFee || 0
      };
      
      const pdfPath = await documentGeneratorService.generateDocumentPDF(orderData, documentType, invoiceDataObj);
      
      // Guardar solo el nombre del archivo en el registro de pago
      const fileName = pdfPath.split('\\').pop() || pdfPath.split('/').pop();
      await payment.update({
        documentPath: fileName
      }, { transaction: t });
    } catch (pdfError) {
      console.error('Error al generar el PDF:', pdfError);
      // Continuamos con el proceso aunque falle la generación del PDF
    }
    
    await t.commit();
    
    return res.status(201).json({
      message: 'Pago procesado exitosamente',
      payment,
      order
    });
    
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: 'Error al procesar el pago', error: error.message });
  }
};

// Verificar estado de pago de un pedido de invitado
exports.getGuestPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      where: { id: orderId },
      include: [{
        model: GuestOrder,
        as: 'guestOrder'
      }],
      attributes: ['id', 'total', 'paymentStatus', 'paymentMethod']
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    if (!order.guestOrder) {
      return res.status(400).json({ message: 'Este pedido no corresponde a un cliente invitado' });
    }
    
    return res.status(200).json({
      orderId: order.id,
      total: order.total,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      documentType: order.documentType,
      invoiceData: order.invoiceData ? JSON.parse(order.invoiceData) : null
    });
    
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener estado de pago', error: error.message });
  }
};

// Generar PDF para pedidos de invitados
exports.generatePDF = async (req, res) => {
  try {
    const { orderData, documentType } = req.body;
    
    if (!orderData) {
      return res.status(400).json({ message: 'Datos del pedido requeridos' });
    }
    
    // Importar el servicio de generación de documentos
    const documentGeneratorService = require('../services/documentGenerator.service');
    
    // Generar el PDF
    const pdfPath = await documentGeneratorService.generateDocumentPDF(orderData, documentType || 'boleta');
    
    // Leer el archivo PDF generado
    const fs = require('fs');
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    // Configurar headers para la descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="boleta_${orderData.id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Enviar el PDF
    res.send(pdfBuffer);
    
    // Limpiar el archivo temporal después de enviarlo
    setTimeout(() => {
      try {
        fs.unlinkSync(pdfPath);
      } catch (cleanupError) {
        console.error('Error al limpiar archivo temporal:', cleanupError);
      }
    }, 5000);
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return res.status(500).json({ message: 'Error al generar PDF', error: error.message });
  }
};