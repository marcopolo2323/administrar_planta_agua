const { GuestOrder, GuestOrderProduct, Product } = require('../models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generar PDF para pedidos de invitados
const generatePDF = async (req, res) => {
  try {
    const { orderData, documentType = 'boleta' } = req.body;

    if (!orderData) {
      return res.status(400).json({
        success: false,
        message: 'Datos del pedido son requeridos'
      });
    }

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Configurar headers para descarga
    const filename = `${documentType}_${orderData.id}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe del documento a la respuesta
    doc.pipe(res);

    // Configurar fuente y tamaño
    doc.fontSize(20).text('PLANTA DE AGUA AQUAYARA', { align: 'center' });
    doc.fontSize(12).text('Av. Principal 123, Lima - Perú', { align: 'center' });
    doc.fontSize(10).text('Tel: +51 961 606 183', { align: 'center' });
    doc.moveDown();

    // Título del documento
    const docTitle = documentType === 'boleta' ? 'BOLETA DE VENTA' : 'FACTURA';
    doc.fontSize(16).text(docTitle, { align: 'center' });
    doc.moveDown();

    // Información del pedido
    doc.fontSize(12).text(`Pedido #${orderData.id}`, { align: 'left' });
    doc.text(`Fecha: ${new Date(orderData.createdAt).toLocaleDateString('es-ES')}`, { align: 'left' });
    doc.text(`Estado: ${orderData.status}`, { align: 'left' });
    doc.moveDown();

    // Información del cliente
    doc.fontSize(14).text('DATOS DEL CLIENTE', { underline: true });
    doc.fontSize(10);
    doc.text(`Nombre: ${orderData.customerName}`);
    doc.text(`Teléfono: ${orderData.customerPhone}`);
    if (orderData.customerEmail) {
      doc.text(`Email: ${orderData.customerEmail}`);
    }
    doc.text(`Dirección: ${orderData.deliveryAddress}`);
    doc.text(`Distrito: ${orderData.deliveryDistrict}`);
    if (orderData.deliveryNotes) {
      doc.text(`Referencia: ${orderData.deliveryNotes}`);
    }
    doc.moveDown();

    // Tabla de productos
    doc.fontSize(14).text('PRODUCTOS', { underline: true });
    doc.moveDown();

    // Encabezados de la tabla
    const tableTop = doc.y;
    const itemCodeX = 50;
    const descriptionX = 100;
    const quantityX = 350;
    const unitPriceX = 400;
    const totalX = 500;

    doc.fontSize(10);
    doc.text('Código', itemCodeX, tableTop);
    doc.text('Descripción', descriptionX, tableTop);
    doc.text('Cant.', quantityX, tableTop);
    doc.text('P. Unit.', unitPriceX, tableTop);
    doc.text('Total', totalX, tableTop);

    // Línea debajo de los encabezados
    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    let currentY = tableTop + 30;
    let subtotal = 0;

    // Productos
    const items = orderData.orderDetails || orderData.items || [];
    items.forEach((item, index) => {
      if (currentY > 700) { // Nueva página si es necesario
        doc.addPage();
        currentY = 50;
      }

      doc.text(`${index + 1}`, itemCodeX, currentY);
      doc.text(item.productName || item.name, descriptionX, currentY);
      doc.text(item.quantity.toString(), quantityX, currentY);
      doc.text(`S/ ${parseFloat(item.unitPrice).toFixed(2)}`, unitPriceX, currentY);
      doc.text(`S/ ${parseFloat(item.subtotal).toFixed(2)}`, totalX, currentY);
      
      subtotal += parseFloat(item.subtotal);
      currentY += 20;
    });

    // Línea final
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 20;

    // Totales
    const deliveryFee = parseFloat(orderData.deliveryFee) || 0;
    const total = parseFloat(orderData.total) || subtotal + deliveryFee;

    doc.text(`Subtotal: S/ ${subtotal.toFixed(2)}`, totalX - 100, currentY);
    currentY += 20;
    doc.text(`Flete: S/ ${deliveryFee.toFixed(2)}`, totalX - 100, currentY);
    currentY += 20;
    doc.fontSize(12).text(`TOTAL: S/ ${total.toFixed(2)}`, totalX - 100, currentY, { underline: true });

    // Información de pago
    currentY += 40;
    doc.fontSize(10);
    doc.text(`Método de pago: ${orderData.paymentMethod || 'Efectivo'}`, 50, currentY);

    // Pie de página
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 100;
    
    doc.fontSize(8);
    doc.text('Gracias por su compra', { align: 'center', y: footerY });
    doc.text('Planta de Agua Aquayara - Agua de calidad para su hogar', { align: 'center', y: footerY + 15 });

    // Finalizar documento
    doc.end();

  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  generatePDF
};
