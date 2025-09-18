const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGeneratorService {
  static generateGuestOrderPDF(orderData, documentType = 'boleta') {
    return new Promise((resolve, reject) => {
      try {
        // Crear un nuevo documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        // Crear un buffer para almacenar el PDF
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Configurar fuentes y estilos
        const titleFont = 'Helvetica-Bold';
        const normalFont = 'Helvetica';
        const smallFont = 'Helvetica';

        // Encabezado
        doc.font(titleFont).fontSize(20).text('AQUAYARA', 50, 50, { align: 'center' });
        doc.font(normalFont).fontSize(12).text('Sistema de Gestión de Planta de Agua', 50, 80, { align: 'center' });
        
        // Línea separadora
        doc.moveTo(50, 110).lineTo(550, 110).stroke();

        // Información del documento
        const docType = documentType === 'factura' ? 'FACTURA' : 'BOLETA DE VENTA';
        doc.font(titleFont).fontSize(16).text(docType, 50, 130);
        
        // Número de documento (usar ID del pedido)
        doc.font(normalFont).fontSize(12).text(`N° ${orderData.id || 'N/A'}`, 450, 130);
        
        // Fecha (corregir zona horaria)
        const now = new Date();
        const peruDate = new Date(now.getTime() - (5 * 60 * 60 * 1000)); // UTC-5 para Perú
        const currentDate = peruDate.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        doc.font(normalFont).fontSize(10).text(`Fecha: ${currentDate}`, 450, 150);

        // Información del cliente
        doc.font(titleFont).fontSize(14).text('DATOS DEL CLIENTE', 50, 180);
        
        const clientY = 200;
        doc.font(normalFont).fontSize(11).text(`Nombre: ${orderData.customerName || 'N/A'}`, 50, clientY);
        doc.font(normalFont).fontSize(11).text(`Teléfono: ${orderData.customerPhone || 'N/A'}`, 50, clientY + 20);
        doc.font(normalFont).fontSize(11).text(`Email: ${orderData.customerEmail || 'N/A'}`, 50, clientY + 40);
        doc.font(normalFont).fontSize(11).text(`Dirección: ${orderData.deliveryAddress || 'N/A'}`, 50, clientY + 60);
        doc.font(normalFont).fontSize(11).text(`Distrito: ${orderData.deliveryDistrict || 'N/A'}`, 50, clientY + 80);

        // Línea separadora
        doc.moveTo(50, clientY + 100).lineTo(550, clientY + 100).stroke();

        // Detalles del pedido
        doc.font(titleFont).fontSize(14).text('DETALLES DEL PEDIDO', 50, clientY + 120);

        // Tabla de productos
        const tableY = clientY + 150;
        const colWidths = [200, 80, 80, 100];
        const colX = [50, 250, 330, 410];

        // Encabezados de la tabla
        doc.font(titleFont).fontSize(10).text('PRODUCTO', colX[0], tableY);
        doc.font(titleFont).fontSize(10).text('CANT.', colX[1], tableY);
        doc.font(titleFont).fontSize(10).text('PRECIO', colX[2], tableY);
        doc.font(titleFont).fontSize(10).text('SUBTOTAL', colX[3], tableY);

        // Línea debajo de encabezados
        doc.moveTo(50, tableY + 20).lineTo(550, tableY + 20).stroke();

        // Productos (si hay items)
        let currentY = tableY + 30;
        if (orderData.items && orderData.items.length > 0) {
          orderData.items.forEach((item, index) => {
            const productName = item.name || item.productName || 'Producto';
            const quantity = item.quantity || 1;
            const price = parseFloat(item.price || item.unitPrice || 0).toFixed(2);
            const subtotal = parseFloat(item.subtotal || (item.price || item.unitPrice || 0) * quantity).toFixed(2);
            
            doc.font(normalFont).fontSize(9).text(productName, colX[0], currentY);
            doc.font(normalFont).fontSize(9).text(quantity.toString(), colX[1], currentY);
            doc.font(normalFont).fontSize(9).text(`S/ ${price}`, colX[2], currentY);
            doc.font(normalFont).fontSize(9).text(`S/ ${subtotal}`, colX[3], currentY);
            currentY += 20;
          });
        } else if (orderData.products && orderData.products.length > 0) {
          // Si los productos están en orderData.products
          orderData.products.forEach((item, index) => {
            const productName = item.name || item.productName || 'Producto';
            const quantity = item.quantity || 1;
            const price = parseFloat(item.price || item.unitPrice || 0).toFixed(2);
            const subtotal = parseFloat(item.subtotal || (item.price || item.unitPrice || 0) * quantity).toFixed(2);
            
            doc.font(normalFont).fontSize(9).text(productName, colX[0], currentY);
            doc.font(normalFont).fontSize(9).text(quantity.toString(), colX[1], currentY);
            doc.font(normalFont).fontSize(9).text(`S/ ${price}`, colX[2], currentY);
            doc.font(normalFont).fontSize(9).text(`S/ ${subtotal}`, colX[3], currentY);
            currentY += 20;
          });
        } else {
          // Si no hay items específicos, mostrar información general
          doc.font(normalFont).fontSize(9).text('Producto de agua', colX[0], currentY);
          doc.font(normalFont).fontSize(9).text('1', colX[1], currentY);
          doc.font(normalFont).fontSize(9).text(`S/ ${orderData.subtotal || '0.00'}`, colX[2], currentY);
          doc.font(normalFont).fontSize(9).text(`S/ ${orderData.subtotal || '0.00'}`, colX[3], currentY);
          currentY += 20;
        }

        // Línea separadora
        doc.moveTo(50, currentY + 10).lineTo(550, currentY + 10).stroke();

        // Totales
        const totalsY = currentY + 30;
        doc.font(titleFont).fontSize(12).text('RESUMEN DE PAGO', 50, totalsY);
        
        const subtotal = parseFloat(orderData.subtotal) || 0;
        const deliveryFee = parseFloat(orderData.deliveryFee) || 0;
        const total = subtotal + deliveryFee;

        doc.font(normalFont).fontSize(11).text(`Subtotal:`, 400, totalsY);
        doc.font(normalFont).fontSize(11).text(`S/ ${subtotal.toFixed(2)}`, 480, totalsY);
        
        if (deliveryFee > 0) {
          doc.font(normalFont).fontSize(11).text(`Flete:`, 400, totalsY + 20);
          doc.font(normalFont).fontSize(11).text(`S/ ${deliveryFee.toFixed(2)}`, 480, totalsY + 20);
        }
        
        // Línea para total
        doc.moveTo(400, totalsY + 40).lineTo(550, totalsY + 40).stroke();
        doc.font(titleFont).fontSize(12).text(`TOTAL:`, 400, totalsY + 50);
        doc.font(titleFont).fontSize(12).text(`S/ ${total.toFixed(2)}`, 480, totalsY + 50);

        // Información de pago
        const paymentY = totalsY + 100;
        doc.font(titleFont).fontSize(12).text('MÉTODO DE PAGO', 50, paymentY);
        
        // Mapear métodos de pago
        let paymentMethodText = 'Efectivo';
        if (orderData.paymentMethod) {
          switch (orderData.paymentMethod.toLowerCase()) {
            case 'plin':
              paymentMethodText = 'Plin';
              break;
            case 'yape':
              paymentMethodText = 'Yape';
              break;
            case 'transferencia':
              paymentMethodText = 'Transferencia bancaria';
              break;
            case 'vale':
              paymentMethodText = 'Vale';
              break;
            default:
              paymentMethodText = orderData.paymentMethod;
          }
        }
        
        doc.font(normalFont).fontSize(11).text(paymentMethodText, 50, paymentY + 20);

        // Pie de página
        const footerY = 750;
        doc.font(smallFont).fontSize(8).text('Gracias por su compra', 50, footerY, { align: 'center' });
        doc.font(smallFont).fontSize(8).text('AquaYara - Sistema de Gestión de Planta de Agua', 50, footerY + 15, { align: 'center' });

        // Finalizar el documento
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGeneratorService;
