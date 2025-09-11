const { Order, GuestOrder, OrderDetail, GuestOrderProduct, Product, Client, User, Voucher } = require('../models');
const { documentGeneratorService } = require('../services/documentGenerator.service');
const fs = require('fs-extra');
const path = require('path');

/**
 * Obtener todas las boletas generadas
 */
exports.getAllDocuments = async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 10 } = req.query;
    
    // Obtener archivos de boletas del directorio
    const documentsDir = path.join(__dirname, '..', '..', 'documents');
    const files = await fs.readdir(documentsDir);
    
    // Filtrar archivos PDF de boletas
    const boletaFiles = files.filter(file => file.startsWith('boleta_') && file.endsWith('.pdf'));
    const facturaFiles = files.filter(file => file.startsWith('factura_') && file.endsWith('.pdf'));
    
    let documentFiles = [];
    if (type === 'boleta') {
      documentFiles = boletaFiles;
    } else if (type === 'factura') {
      documentFiles = facturaFiles;
    } else {
      documentFiles = [...boletaFiles, ...facturaFiles];
    }
    
    // Ordenar por fecha de modificación (más recientes primero)
    const documentInfo = await Promise.all(
      documentFiles.map(async (file) => {
        const filePath = path.join(documentsDir, file);
        const stats = await fs.stat(filePath);
        
        // Extraer información del nombre del archivo
        const parts = file.replace('.pdf', '').split('_');
        let orderId = null;
        let timestamp = null;
        
        // Manejar diferentes formatos de nombres de archivo
        if (parts.length >= 3) {
          // Formato: boleta_123_1234567890.pdf
          orderId = parseInt(parts[1]);
          timestamp = parseInt(parts[2]);
        } else if (parts.length === 2) {
          // Formato alternativo: boleta_123.pdf
          orderId = parseInt(parts[1]);
          timestamp = stats.birthtime.getTime();
        } else if (parts.length === 1) {
          // Formato: boleta.pdf (sin ID)
          orderId = null;
          timestamp = stats.birthtime.getTime();
        }
        
        // Validar que el orderId sea un número válido
        if (orderId && (isNaN(orderId) || orderId <= 0)) {
          orderId = null;
        }
        
        return {
          filename: file,
          orderId: orderId,
          timestamp: timestamp,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          size: stats.size,
          type: file.startsWith('boleta_') ? 'boleta' : 'factura',
          path: filePath
        };
      })
    );
    
    // Ordenar por fecha de creación (más recientes primero)
    documentInfo.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Paginación
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedDocuments = documentInfo.slice(startIndex, endIndex);
    
    // Obtener información de los pedidos asociados
    const documentsWithOrderInfo = await Promise.all(
      paginatedDocuments.map(async (doc) => {
        try {
          // Si no hay orderId, devolver solo la información del archivo
          if (!doc.orderId) {
            return {
              ...doc,
              orderType: 'unknown',
              order: null
            };
          }

          // Buscar en pedidos regulares
          let order = await Order.findByPk(doc.orderId, {
            include: [
              { model: Client, attributes: ['id', 'name', 'phone', 'email'] },
              { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] }
            ]
          });
          
          if (order) {
            return {
              ...doc,
              orderType: 'regular',
              order: {
                id: order.id,
                clientName: order.Client?.name || 'Cliente no encontrado',
                clientPhone: order.Client?.phone || 'N/A',
                clientEmail: order.Client?.email || 'N/A',
                deliveryAddress: order.deliveryAddress,
                deliveryDistrict: order.deliveryDistrict,
                total: order.total,
                subtotal: order.subtotal,
                deliveryFee: order.deliveryFee,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt
              }
            };
          }
          
          // Buscar en pedidos de invitados
          const guestOrder = await GuestOrder.findByPk(doc.orderId, {
            include: [
              { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] }
            ]
          });
          
          if (guestOrder) {
            return {
              ...doc,
              orderType: 'guest',
              order: {
                id: guestOrder.id,
                clientName: guestOrder.customerName || 'Cliente visitante',
                clientPhone: guestOrder.customerPhone || 'N/A',
                clientEmail: guestOrder.customerEmail || 'N/A',
                deliveryAddress: guestOrder.deliveryAddress,
                deliveryDistrict: guestOrder.deliveryDistrict,
                total: guestOrder.totalAmount,
                subtotal: guestOrder.subtotal,
                deliveryFee: guestOrder.deliveryFee,
                status: guestOrder.status,
                paymentStatus: guestOrder.paymentStatus,
                paymentMethod: guestOrder.paymentMethod,
                createdAt: guestOrder.createdAt
              }
            };
          }
          
          // Si no se encuentra el pedido, devolver solo la información del archivo
          return {
            ...doc,
            orderType: 'unknown',
            order: {
              id: doc.orderId,
              clientName: 'Pedido no encontrado',
              clientPhone: 'N/A',
              clientEmail: 'N/A',
              deliveryAddress: 'N/A',
              deliveryDistrict: 'N/A',
              total: 0,
              subtotal: 0,
              deliveryFee: 0,
              status: 'unknown',
              paymentStatus: 'unknown',
              paymentMethod: 'unknown',
              createdAt: doc.createdAt
            }
          };
        } catch (error) {
          console.error(`Error al obtener información del pedido ${doc.orderId}:`, error);
          return {
            ...doc,
            orderType: 'error',
            order: {
              id: doc.orderId || 'Error',
              clientName: 'Error al cargar datos',
              clientPhone: 'N/A',
              clientEmail: 'N/A',
              deliveryAddress: 'N/A',
              deliveryDistrict: 'N/A',
              total: 0,
              subtotal: 0,
              deliveryFee: 0,
              status: 'error',
              paymentStatus: 'error',
              paymentMethod: 'error',
              createdAt: doc.createdAt
            }
          };
        }
      })
    );
    
    res.json({
      success: true,
      data: documentsWithOrderInfo,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: documentInfo.length,
        pages: Math.ceil(documentInfo.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Descargar una boleta específica
 */
exports.downloadDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    
    const documentsDir = path.join(__dirname, '..', '..', 'documents');
    const filePath = path.join(documentsDir, filename);
    
    // Verificar que el archivo existe
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }
    
    // Enviar el archivo
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error al descargar archivo:', err);
        res.status(500).json({
          success: false,
          message: 'Error al descargar el archivo'
        });
      }
    });
  } catch (error) {
    console.error('Error al descargar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Generar boleta para un pedido existente
 */
exports.generateDocumentForOrder = async (req, res) => {
  try {
    const { orderId, orderType = 'regular', documentType = 'boleta' } = req.body;
    
    let orderData = null;
    
    if (orderType === 'regular') {
      // Buscar pedido regular
      orderData = await Order.findByPk(orderId, {
        include: [
          { model: Client, attributes: ['id', 'name', 'phone', 'email'] },
          { 
            model: OrderDetail,
            as: 'orderDetails',
            include: [{ model: Product, attributes: ['id', 'name', 'unitPrice'] }]
          }
        ]
      });
      
      if (!orderData) {
        return res.status(404).json({
          success: false,
          message: 'Pedido regular no encontrado'
        });
      }
      
      // Preparar datos para el generador de documentos
      orderData = {
        id: orderData.id,
        customerName: orderData.Client?.name,
        customerPhone: orderData.Client?.phone,
        customerEmail: orderData.Client?.email,
        deliveryAddress: orderData.deliveryAddress,
        deliveryDistrict: orderData.deliveryDistrict,
        total: parseFloat(orderData.total),
        subtotal: parseFloat(orderData.subtotal),
        deliveryFee: parseFloat(orderData.deliveryFee || 0),
        paymentMethod: orderData.paymentMethod,
        orderDetails: orderData.orderDetails.map(detail => ({
          productName: detail.Product?.name || 'Producto',
          quantity: detail.quantity,
          unitPrice: parseFloat(detail.unitPrice),
          subtotal: parseFloat(detail.subtotal)
        }))
      };
    } else if (orderType === 'guest') {
      // Buscar pedido de invitado
      orderData = await GuestOrder.findByPk(orderId, {
        include: [
          {
            model: GuestOrderProduct,
            as: 'products',
            include: [{ model: Product, attributes: ['id', 'name', 'unitPrice'] }]
          }
        ]
      });
      
      if (!orderData) {
        return res.status(404).json({
          success: false,
          message: 'Pedido de invitado no encontrado'
        });
      }
      
      // Preparar datos para el generador de documentos
      orderData = {
        id: orderData.id,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        deliveryAddress: orderData.deliveryAddress,
        deliveryDistrict: orderData.deliveryDistrict,
        total: parseFloat(orderData.totalAmount),
        subtotal: parseFloat(orderData.subtotal),
        deliveryFee: parseFloat(orderData.deliveryFee || 0),
        paymentMethod: orderData.paymentMethod,
        orderDetails: orderData.products.map(item => ({
          productName: item.Product?.name || 'Producto',
          quantity: item.quantity,
          unitPrice: parseFloat(item.price),
          subtotal: parseFloat(item.subtotal)
        }))
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo de pedido no válido'
      });
    }
    
    // Generar el documento
    const filePath = await documentGeneratorService.generateDocumentPDF(
      orderData,
      documentType
    );
    
    // Obtener información del archivo generado
    const stats = await fs.stat(filePath);
    const filename = path.basename(filePath);
    
    res.json({
      success: true,
      message: 'Documento generado correctamente',
      data: {
        filename,
        filePath,
        size: stats.size,
        type: documentType,
        orderId: orderData.id,
        orderType
      }
    });
  } catch (error) {
    console.error('Error al generar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de documentos
 */
exports.getDocumentStats = async (req, res) => {
  try {
    const documentsDir = path.join(__dirname, '..', '..', 'documents');
    const files = await fs.readdir(documentsDir);
    
    const boletaFiles = files.filter(file => file.startsWith('boleta_') && file.endsWith('.pdf'));
    const facturaFiles = files.filter(file => file.startsWith('factura_') && file.endsWith('.pdf'));
    
    // Calcular estadísticas
    const totalDocuments = boletaFiles.length + facturaFiles.length;
    const totalSize = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(documentsDir, file);
        const stats = await fs.stat(filePath);
        return stats.size;
      })
    ).then(sizes => sizes.reduce((sum, size) => sum + size, 0));
    
    // Documentos generados en los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDocuments = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(documentsDir, file);
        const stats = await fs.stat(filePath);
        return {
          filename: file,
          createdAt: stats.birthtime
        };
      })
    ).then(docs => 
      docs.filter(doc => new Date(doc.createdAt) >= thirtyDaysAgo)
    );
    
    res.json({
      success: true,
      data: {
        totalDocuments,
        totalBoletas: boletaFiles.length,
        totalFacturas: facturaFiles.length,
        totalSize,
        recentDocuments: recentDocuments.length,
        averageSize: totalDocuments > 0 ? Math.round(totalSize / totalDocuments) : 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Eliminar un documento
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    
    const documentsDir = path.join(__dirname, '..', '..', 'documents');
    const filePath = path.join(documentsDir, filename);
    
    // Verificar que el archivo existe
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }
    
    // Eliminar el archivo
    await fs.remove(filePath);
    
    res.json({
      success: true,
      message: 'Documento eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
