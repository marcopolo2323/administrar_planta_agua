const ElectronicInvoice = require('../models/electronicInvoice.model');
const Sale = require('../models/sale.model');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Servicio ficticio para integración con proveedor de facturación electrónica
const electronicInvoiceService = {
  generateXML: async (saleData, clientData) => {
    // Simulación de generación de XML
    return `<?xml version="1.0" encoding="UTF-8"?><Invoice>...</Invoice>`;
  },
  sendInvoice: async (xmlContent) => {
    // Simulación de envío a la DIAN
    return {
      success: true,
      responseCode: '200',
      responseMessage: 'Factura recibida correctamente',
      cufe: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      qrCode: 'https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=123456789',
      pdfUrl: 'https://example.com/invoice.pdf'
    };
  }
};

// Obtener todas las facturas electrónicas
exports.getAllElectronicInvoices = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (startDate && endDate) {
      whereClause.invoiceDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const invoices = await ElectronicInvoice.findAll({
      where: whereClause,
      order: [['invoiceDate', 'DESC']],
      include: [{ model: Sale }]
    });
    
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error al obtener facturas electrónicas:', error);
    res.status(500).json({ message: 'Error al obtener facturas electrónicas', error: error.message });
  }
};

// Obtener factura electrónica por ID
exports.getElectronicInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await ElectronicInvoice.findByPk(id, {
      include: [{ model: Sale }]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura electrónica no encontrada' });
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error al obtener factura electrónica:', error);
    res.status(500).json({ message: 'Error al obtener factura electrónica', error: error.message });
  }
};

// Generar factura electrónica a partir de una venta
exports.generateElectronicInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { saleId } = req.body;
    
    // Verificar si la venta existe
    const sale = await Sale.findByPk(saleId, {
      include: [
        { model: require('../models/client.model') },
        { model: require('../models/saleDetail.model'), include: [{ model: require('../models/product.model') }] }
      ],
      transaction
    });
    
    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Verificar si ya existe una factura para esta venta
    const existingInvoice = await ElectronicInvoice.findOne({
      where: { SaleId: saleId },
      transaction
    });
    
    if (existingInvoice) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Ya existe una factura electrónica para esta venta' });
    }
    
    // Generar XML
    const xmlContent = await electronicInvoiceService.generateXML(sale, sale.Client);
    
    // Enviar a la DIAN (simulado)
    const response = await electronicInvoiceService.sendInvoice(xmlContent);
    
    // Crear registro de factura electrónica
    const invoiceNumber = `FE-${new Date().getFullYear()}-${String(sale.id).padStart(6, '0')}`;
    
    const electronicInvoice = await ElectronicInvoice.create({
      invoiceNumber,
      invoiceDate: new Date(),
      status: response.success ? 'aceptada' : 'rechazada',
      xmlContent,
      pdfUrl: response.pdfUrl,
      responseCode: response.responseCode,
      responseMessage: response.responseMessage,
      cufe: response.cufe,
      qrCode: response.qrCode,
      totalAmount: sale.total,
      taxAmount: sale.tax || 0,
      SaleId: sale.id
    }, { transaction });
    
    // Actualizar estado de la venta
    await sale.update({ hasElectronicInvoice: true }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Factura electrónica generada correctamente',
      invoice: electronicInvoice
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al generar factura electrónica:', error);
    res.status(500).json({ message: 'Error al generar factura electrónica', error: error.message });
  }
};

// Reenviar factura electrónica
exports.resendElectronicInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const invoice = await ElectronicInvoice.findByPk(id, {
      include: [{ model: Sale, include: [{ model: require('../models/client.model') }] }],
      transaction
    });
    
    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Factura electrónica no encontrada' });
    }
    
    // Reenviar a la DIAN (simulado)
    const response = await electronicInvoiceService.sendInvoice(invoice.xmlContent);
    
    // Actualizar registro de factura electrónica
    await invoice.update({
      status: response.success ? 'aceptada' : 'rechazada',
      pdfUrl: response.pdfUrl,
      responseCode: response.responseCode,
      responseMessage: response.responseMessage,
      cufe: response.cufe,
      qrCode: response.qrCode
    }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Factura electrónica reenviada correctamente',
      invoice
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al reenviar factura electrónica:', error);
    res.status(500).json({ message: 'Error al reenviar factura electrónica', error: error.message });
  }
};

// Enviar factura por correo electrónico
exports.sendInvoiceByEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es requerido' });
    }
    
    const invoice = await ElectronicInvoice.findByPk(id, {
      include: [{ model: Sale }]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura electrónica no encontrada' });
    }
    
    // Simulación de envío de correo electrónico
    // En un entorno real, aquí se integraría con un servicio de correo
    
    res.status(200).json({
      message: `Factura electrónica enviada correctamente al correo ${email}`
    });
  } catch (error) {
    console.error('Error al enviar factura por correo:', error);
    res.status(500).json({ message: 'Error al enviar factura por correo', error: error.message });
  }
};

// Enviar factura por WhatsApp
exports.sendInvoiceByWhatsApp = async (req, res) => {
  try {
    const { id } = req.params;
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: 'El número de teléfono es requerido' });
    }
    
    const invoice = await ElectronicInvoice.findByPk(id, {
      include: [{ model: Sale }]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura electrónica no encontrada' });
    }
    
    // Simulación de envío por WhatsApp
    // En un entorno real, aquí se integraría con la API de WhatsApp Business
    
    res.status(200).json({
      message: `Factura electrónica enviada correctamente al WhatsApp ${phoneNumber}`
    });
  } catch (error) {
    console.error('Error al enviar factura por WhatsApp:', error);
    res.status(500).json({ message: 'Error al enviar factura por WhatsApp', error: error.message });
  }
};