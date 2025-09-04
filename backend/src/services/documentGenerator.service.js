const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

/**
 * Servicio para generar documentos PDF (boletas y facturas)
 */
class DocumentGeneratorService {
  /**
   * Genera un PDF para una boleta o factura
   * @param {Object} orderData - Datos del pedido
   * @param {string} documentType - Tipo de documento ('boleta' o 'factura')
   * @param {Object} invoiceData - Datos de facturación (solo para facturas)
   * @returns {string} - Ruta del archivo PDF generado
   */
  async generateDocumentPDF(orderData, documentType, invoiceData = null) {
    try {
      // Crear directorio para documentos si no existe
      const documentsDir = path.join(__dirname, '..', '..', 'documents');
      await fs.ensureDir(documentsDir);
      
      // Generar nombre de archivo único
      const timestamp = new Date().getTime();
      const fileName = `${documentType}_${orderData.id}_${timestamp}.pdf`;
      const filePath = path.join(documentsDir, fileName);
      
      // Crear documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `${documentType === 'factura' ? 'Factura Electrónica' : 'Boleta de Venta'} - ${orderData.id}`,
          Author: 'Sistema de Punto de Venta',
          Subject: `${documentType === 'factura' ? 'Factura' : 'Boleta'} para el pedido ${orderData.id}`,
        }
      });
      
      // Crear stream para escribir el PDF
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Encabezado del documento
      this._addHeader(doc, documentType, orderData.id);
      
      // Información del cliente
      if (documentType === 'factura' && invoiceData) {
        this._addInvoiceClientInfo(doc, invoiceData, orderData);
      } else {
        this._addReceiptClientInfo(doc, orderData);
      }
      
      // Detalles del pedido
      this._addOrderDetails(doc, orderData);
      
      // Totales
      this._addTotals(doc, orderData);
      
      // Pie de página
      this._addFooter(doc);
      
      // Finalizar documento
      doc.end();
      
      // Esperar a que se complete la escritura del archivo
      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          resolve(filePath);
        });
        stream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      throw error;
    }
  }
  
  /**
   * Agrega el encabezado al documento
   * @param {PDFDocument} doc - Documento PDF
   * @param {string} documentType - Tipo de documento
   * @param {string} orderId - ID del pedido
   */
  _addHeader(doc, documentType, orderId) {
    // Logo y nombre de la empresa
    doc.fontSize(16) // Reducir tamaño de fuente
       .font('Helvetica-Bold')
       .text('AGUA PURIFICADA DEL VALLE', { align: 'center' })
       .moveDown(0.3); // Reducir espacio
    
    // Información de la empresa
    doc.fontSize(9) // Reducir tamaño de fuente
       .font('Helvetica')
       .text('RUC: 20123456789', { align: 'center' })
       .text('Av. Principal 123, Lima, Perú', { align: 'center' })
       .text('Teléfono: (01) 123-4567', { align: 'center' })
       .moveDown(0.5); // Reducir espacio
    
    // Tipo de documento y número
    doc.fontSize(14) // Reducir tamaño de fuente
       .font('Helvetica-Bold')
       .text(documentType === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA', { align: 'center' })
       .fontSize(11) // Reducir tamaño de fuente
       .text(`N° ${orderId}`, { align: 'center' })
       .moveDown(0.3); // Reducir espacio
    
    // Fecha
    const currentDate = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    doc.fontSize(9) // Reducir tamaño de fuente
       .font('Helvetica')
       .text(`Fecha: ${currentDate}`, { align: 'right' })
       .moveDown(0.5); // Reducir espacio
    
    // Línea separadora
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .stroke()
       .moveDown(0.3); // Reducir espacio
  }
  
  /**
   * Agrega información del cliente para boletas
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} orderData - Datos del pedido
   */
  _addReceiptClientInfo(doc, orderData) {
    doc.fontSize(11) // Reducir tamaño de fuente
       .font('Helvetica-Bold')
       .text('DATOS DEL CLIENTE')
       .moveDown(0.3); // Reducir espacio
    
    doc.fontSize(9) // Reducir tamaño de fuente
       .font('Helvetica')
       .text(`Cliente: ${orderData.customerName || orderData.guestOrder?.guestName || 'Cliente Final'}`)
       .text(`Teléfono: ${orderData.customerPhone || orderData.guestOrder?.guestPhone || 'No especificado'}`)
       .text(`Email: ${orderData.customerEmail || orderData.guestOrder?.guestEmail || 'No especificado'}`)
       .moveDown(0.3); // Reducir espacio
    
    if (orderData.deliveryAddress) {
      doc.text(`Dirección de entrega: ${orderData.deliveryAddress}`)
         .moveDown(0.3); // Reducir espacio
    }
    
    if (orderData.deliveryDistrict) {
      doc.text(`Distrito: ${orderData.deliveryDistrict}`)
         .moveDown(0.3); // Reducir espacio
    }
    
    // Línea separadora
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .stroke()
       .moveDown(0.3); // Reducir espacio
  }
  
  /**
   * Agrega información del cliente para facturas
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} invoiceData - Datos de facturación
   * @param {Object} orderData - Datos del pedido (opcional)
   */
  _addInvoiceClientInfo(doc, invoiceData, orderData = null) {
    // Parsear datos de facturación si vienen como string
    const data = typeof invoiceData === 'string' ? JSON.parse(invoiceData) : invoiceData;
    
    doc.fontSize(11) // Reducir tamaño de fuente
       .font('Helvetica-Bold')
       .text('DATOS DE FACTURACIÓN')
       .moveDown(0.3); // Reducir espacio
    
    doc.fontSize(9) // Reducir tamaño de fuente
       .font('Helvetica')
       .text(`RUC: ${data.ruc}`)
       .text(`Razón Social: ${data.businessName}`)
       .text(`Dirección Fiscal: ${data.address}`)
       .moveDown(0.3); // Reducir espacio
    
    // Mostrar información de entrega si está disponible
    if (orderData) {
      if (orderData.deliveryAddress) {
        doc.text(`Dirección de entrega: ${orderData.deliveryAddress}`)
           .moveDown(0.3); // Reducir espacio
      }
      
      if (orderData.deliveryDistrict) {
        doc.text(`Distrito: ${orderData.deliveryDistrict}`)
           .moveDown(0.3); // Reducir espacio
      }
    }
    
    // Línea separadora
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .stroke()
       .moveDown(0.3); // Reducir espacio
  }
  
  /**
   * Agrega los detalles del pedido
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} orderData - Datos del pedido
   */
  _addOrderDetails(doc, orderData) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('DETALLE DE PRODUCTOS')
       .moveDown(0.5);
    
    // Encabezados de la tabla
    const tableTop = doc.y;
    const tableHeaders = ['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal'];
    // Ajustar anchos de columna para optimizar espacio
    const columnWidths = [220, 60, 70, 70];
    let currentX = 50;
    
    // Verificar si hay datos de compra y buscar en todas las posibles ubicaciones
    if (!orderData.orderDetails && !orderData.items) {
      // Intentar obtener datos de compra desde otras propiedades
      if (orderData.order && orderData.order.orderDetails) {
        orderData.orderDetails = orderData.order.orderDetails;
      } else if (orderData.order && orderData.order.items) {
        orderData.items = orderData.order.items;
      } else if (orderData.payment && orderData.payment.order && orderData.payment.order.orderDetails) {
        orderData.orderDetails = orderData.payment.order.orderDetails;
      } else if (orderData.payment && orderData.payment.order && orderData.payment.order.items) {
        orderData.items = orderData.payment.order.items;
      } else if (orderData.sale && orderData.sale.saleDetails) {
        orderData.items = orderData.sale.saleDetails;
      }
    }
    
    // Asegurarse de que los precios unitarios y subtotales estén disponibles
    if (orderData.items && orderData.items.length > 0) {
      orderData.items = orderData.items.map(item => {
        const unitPrice = item.unitPrice || item.price || 0;
        const quantity = item.quantity || 1;
        return {
          ...item,
          unitPrice: unitPrice,
          subtotal: item.subtotal || (quantity * unitPrice)
        };
      });
      
      // Calcular el total basado en los items
      if (!orderData.total || orderData.total === 0) {
        orderData.total = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
      }
    }
    
    if (orderData.orderDetails && orderData.orderDetails.length > 0) {
      orderData.orderDetails = orderData.orderDetails.map(detail => {
        const unitPrice = detail.unitPrice || (detail.product && detail.product.unitPrice) || 0;
        const quantity = detail.quantity || 1;
        return {
          ...detail,
          unitPrice: unitPrice,
          subtotal: detail.subtotal || (quantity * unitPrice)
        };
      });
      
      // Calcular el total basado en los orderDetails
      if (!orderData.total || orderData.total === 0) {
        orderData.total = orderData.orderDetails.reduce((sum, detail) => sum + detail.subtotal, 0);
      }
    }
    
    // Registrar en consola para depuración
    console.log('Datos para generar documento:', {
      tieneOrderDetails: !!orderData.orderDetails && orderData.orderDetails.length > 0,
      tieneItems: !!orderData.items && orderData.items.length > 0,
      orderDataKeys: Object.keys(orderData)
    });
    
    doc.fontSize(10)
       .font('Helvetica-Bold');
    
    tableHeaders.forEach((header, i) => {
      const align = i === 0 ? 'left' : 'right';
      doc.text(header, currentX, tableTop, { width: columnWidths[i], align });
      currentX += columnWidths[i];
    });
    
    doc.moveDown(0.5);
    
    // Línea separadora después de los encabezados
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .stroke()
       .moveDown(0.5);
    
    // Contenido de la tabla
    doc.font('Helvetica');
    
    try {
      // Intentar obtener detalles del pedido de diferentes fuentes
      const orderDetails = orderData.orderDetails || 
                          (orderData.order && orderData.order.orderDetails) || 
                          (orderData.payment && orderData.payment.order && orderData.payment.order.orderDetails) ||
                          [];
      
      const items = orderData.items || 
                   (orderData.order && orderData.order.items) || 
                   (orderData.payment && orderData.payment.order && orderData.payment.order.items) ||
                   [];
      
      // Intentar obtener detalles de la venta si es un objeto de pago
      const saleDetails = (orderData.sale && orderData.sale.saleDetails) ? 
                         orderData.sale.saleDetails : 
                         [];
      
      // Verificar si hay detalles de venta y procesarlos
      if (saleDetails && saleDetails.length > 0) {
        saleDetails.forEach(item => {
          try {
            const productName = item.productName || 'Producto';
            const quantity = item.quantity || 1;
            const unitPrice = item.unitPrice || 0;
            const subtotal = item.subtotal || (unitPrice * quantity);
            
            currentX = 50;
            const rowTop = doc.y;
            
            // Producto
            doc.text(productName, currentX, rowTop, { width: columnWidths[0], align: 'left' });
            currentX += columnWidths[0];
            
            // Cantidad
            doc.text(quantity.toString(), currentX, rowTop, { width: columnWidths[1], align: 'right' });
            currentX += columnWidths[1];
            
            // Precio unitario
            doc.text(`S/ ${typeof unitPrice === 'number' ? unitPrice.toFixed(2) : '0.00'}`, currentX, rowTop, { width: columnWidths[2], align: 'right' });
            currentX += columnWidths[2];
            
            // Subtotal
            doc.text(`S/ ${typeof subtotal === 'number' ? subtotal.toFixed(2) : '0.00'}`, currentX, rowTop, { width: columnWidths[3], align: 'right' });
            
            doc.moveDown(0.5);
          } catch (itemError) {
            console.error('Error al procesar item de venta:', itemError);
            // Continuar con el siguiente item
          }
        });
      } else if (orderDetails && orderDetails.length > 0) {
        orderDetails.forEach(item => {
          try {
            const product = item.product || {};
            const quantity = item.quantity || 1;
            const unitPrice = item.unitPrice || product.unitPrice || 0;
            const subtotal = item.subtotal || (unitPrice * quantity);
            
            currentX = 50;
            const rowTop = doc.y;
            
            // Producto
            doc.text(product.name || 'Producto', currentX, rowTop, { width: columnWidths[0], align: 'left' });
            currentX += columnWidths[0];
            
            // Cantidad
            doc.text(quantity.toString(), currentX, rowTop, { width: columnWidths[1], align: 'right' });
            currentX += columnWidths[1];
            
            // Precio unitario
            doc.text(`S/ ${typeof unitPrice === 'number' ? unitPrice.toFixed(2) : '0.00'}`, currentX, rowTop, { width: columnWidths[2], align: 'right' });
            currentX += columnWidths[2];
            
            // Subtotal
            doc.text(`S/ ${typeof subtotal === 'number' ? subtotal.toFixed(2) : '0.00'}`, currentX, rowTop, { width: columnWidths[3], align: 'right' });
            
            doc.moveDown(0.5);
          } catch (itemError) {
            console.error('Error al procesar item:', itemError);
            // Continuar con el siguiente item
          }
        });
      } else if (items && items.length > 0) {
        // Formato alternativo para items
        items.forEach(item => {
          try {
            const productName = item.product?.name || item.productName || 'Producto';
            const quantity = item.quantity || 1;
            const unitPrice = item.price || item.unitPrice || 0;
            const subtotal = item.subtotal || (unitPrice * quantity);
            
            currentX = 50;
            const rowTop = doc.y;
            
            // Producto
            doc.text(productName, currentX, rowTop, { width: columnWidths[0], align: 'left' });
            currentX += columnWidths[0];
            
            // Cantidad
            doc.text(quantity.toString(), currentX, rowTop, { width: columnWidths[1], align: 'right' });
            currentX += columnWidths[1];
            
            // Precio unitario
            doc.text(`S/ ${typeof unitPrice === 'number' ? unitPrice.toFixed(2) : '0.00'}`, currentX, rowTop, { width: columnWidths[2], align: 'right' });
            currentX += columnWidths[2];
            
            // Subtotal
            doc.text(`S/ ${typeof subtotal === 'number' ? subtotal.toFixed(2) : '0.00'}`, currentX, rowTop, { width: columnWidths[3], align: 'right' });
            
            doc.moveDown(0.5);
          } catch (itemError) {
            console.error('Error al procesar item:', itemError);
            // Continuar con el siguiente item
          }
        });
      } else {
        // Si no hay detalles, mostrar un mensaje
        doc.text('No hay productos en este pedido', 50, doc.y, { align: 'center' });
        doc.moveDown(0.5);
      }
    } catch (detailsError) {
      console.error('Error al procesar detalles del pedido:', detailsError);
      doc.text('Error al procesar detalles del pedido', 50, doc.y, { align: 'center' });
      doc.moveDown(0.5);
    }
    
    // Línea separadora después de los productos
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .stroke()
       .moveDown(0.5);
  }
  
  /**
   * Agrega los totales del pedido
   * @param {PDFDocument} doc - Documento PDF
   * @param {Object} orderData - Datos del pedido
   */
  _addTotals(doc, orderData) {
    try {
      // Asegurar que todos los valores sean números
      let total = 0;
      try {
        total = typeof orderData.total === 'number' ? orderData.total : parseFloat(orderData.total || 0);
        if (isNaN(total)) {
          // Si no hay total, calcularlo a partir de los items o orderDetails
          if (orderData.items && orderData.items.length > 0) {
            total = orderData.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
          } else if (orderData.orderDetails && orderData.orderDetails.length > 0) {
            total = orderData.orderDetails.reduce((sum, detail) => sum + (detail.subtotal || 0), 0);
          } else {
            total = 0;
          }
        }
      } catch (e) {
        console.error('Error al convertir total a número:', e);
        total = 0;
      }
      
      let subtotal = 0;
      try {
        // Si hay subtotal, usarlo; si no, calcularlo como total/1.18
        if (orderData.subtotal !== undefined && orderData.subtotal !== null) {
          subtotal = typeof orderData.subtotal === 'number' ? orderData.subtotal : parseFloat(orderData.subtotal || 0);
          if (isNaN(subtotal)) subtotal = Math.round((total / 1.18) * 100) / 100;
        } else {
          // Calcular subtotal como total/1.18 (redondeado a 2 decimales)
          subtotal = Math.round((total / 1.18) * 100) / 100;
        }
      } catch (e) {
        console.error('Error al calcular subtotal:', e);
        subtotal = Math.round((total / 1.18) * 100) / 100;
      }
      
      let igv = 0;
      try {
        // Si hay impuesto, usarlo; si no, calcularlo como total - subtotal
        if (orderData.tax !== undefined && orderData.tax !== null) {
          igv = typeof orderData.tax === 'number' ? orderData.tax : parseFloat(orderData.tax || 0);
          if (isNaN(igv)) igv = Math.round((total - subtotal) * 100) / 100;
        } else {
          // Calcular IGV como total - subtotal (redondeado a 2 decimales)
          igv = Math.round((total - subtotal) * 100) / 100;
        }
      } catch (e) {
        console.error('Error al calcular IGV:', e);
        igv = Math.round((total * 0.18) * 100) / 100;
      }
      
      // Obtener el costo de envío si existe
      let deliveryFee = 0;
      try {
        if (orderData.deliveryFee !== undefined && orderData.deliveryFee !== null) {
          deliveryFee = typeof orderData.deliveryFee === 'number' ? orderData.deliveryFee : parseFloat(orderData.deliveryFee || 0);
          if (isNaN(deliveryFee)) deliveryFee = 0;
        }
      } catch (e) {
        console.error('Error al obtener costo de envío:', e);
        deliveryFee = 0;
      }
      
      // Alinear a la derecha
      const rightColumnX = doc.page.width - 150;
      const rightColumnWidth = 100;
      
      doc.fontSize(10)
         .font('Helvetica')
         .text('Subtotal:', rightColumnX, doc.y, { width: rightColumnWidth, align: 'left' })
         .text(`S/ ${subtotal.toFixed(2)}`, rightColumnX + rightColumnWidth, doc.y - doc.currentLineHeight(), { width: rightColumnWidth, align: 'right' })
         .moveDown(0.5);
      
      doc.text('IGV (18%):', rightColumnX, doc.y, { width: rightColumnWidth, align: 'left' })
         .text(`S/ ${igv.toFixed(2)}`, rightColumnX + rightColumnWidth, doc.y - doc.currentLineHeight(), { width: rightColumnWidth, align: 'right' })
         .moveDown(0.5);
      
      // Mostrar costo de envío si existe
      if (deliveryFee > 0) {
        doc.text('Costo de envío:', rightColumnX, doc.y, { width: rightColumnWidth, align: 'left' })
           .text(`S/ ${deliveryFee.toFixed(2)}`, rightColumnX + rightColumnWidth, doc.y - doc.currentLineHeight(), { width: rightColumnWidth, align: 'right' })
           .moveDown(0.5);
      }
      
      // Línea separadora para el total
      doc.moveTo(rightColumnX, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke()
         .moveDown(0.5);
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('TOTAL:', rightColumnX, doc.y, { width: rightColumnWidth, align: 'left' })
         .text(`S/ ${total.toFixed(2)}`, rightColumnX + rightColumnWidth, doc.y - doc.currentLineHeight(), { width: rightColumnWidth, align: 'right' })
         .moveDown(1);
    } catch (error) {
      console.error('Error al generar totales:', error);
      // Mostrar un mensaje de error en el documento
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Error al calcular totales', { align: 'center' })
         .moveDown(1);
    }
  }
  
  /**
   * Agrega el pie de página al documento
   * @param {PDFDocument} doc - Documento PDF
   */
  _addFooter(doc) {
    // Línea separadora
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .stroke()
       .moveDown(0.3); // Reducir espacio
    
    // Mensaje de agradecimiento
    doc.fontSize(9) // Reducir tamaño de fuente
       .font('Helvetica')
       .text('¡Gracias por su compra!', { align: 'center' })
       .moveDown(0.3); // Reducir espacio
    
    // Información adicional
    doc.fontSize(7) // Reducir tamaño de fuente
       .text('Este documento es un comprobante válido para efectos fiscales.', { align: 'center' })
       .text('Para cualquier consulta, contáctenos al (01) 123-4567 o visite nuestra página web.', { align: 'center' })
       .moveDown(0.3); // Reducir espacio
    
    // Número de página
    const pageNumber = `Página ${doc.page.pageNumber}`;
    doc.text(pageNumber, 50, doc.page.height - 40, { align: 'center' });
  }
  
  /**
   * Envía el documento por correo electrónico
   * @param {string} filePath - Ruta del archivo PDF
   * @param {string} email - Correo electrónico del destinatario
   * @param {string} documentType - Tipo de documento
   * @returns {Promise<boolean>} - Resultado del envío
   */
  async sendDocumentByEmail(filePath, email, documentType) {
    // TODO: Implementar envío de correo electrónico
    console.log(`Simulando envío de ${documentType} a ${email}: ${filePath}`);
    return true;
  }
}

module.exports = new DocumentGeneratorService();