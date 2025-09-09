const { Sale, SaleDetail, Product, Client, User, Payment, sequelize } = require('../models');
const { Op } = require('sequelize');
const documentGeneratorService = require('../services/documentGenerator.service');
const path = require('path');
const fs = require('fs-extra');

/**
 * Crear una nueva venta
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos para la creación de la venta
 * @param {number} req.body.clientId - ID del cliente
 * @param {Array} req.body.products - Lista de productos a vender
 * @param {string} req.body.invoiceType - Tipo de factura (boleta, factura, vale)
 * @param {string} req.body.invoiceNumber - Número de factura
 * @param {string} req.body.notes - Notas adicionales
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Información de la venta creada
 */
exports.createSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { clientId, products, invoiceType, invoiceNumber, notes } = req.body;
    const userId = req.userId; // Obtenido del middleware de autenticación

    // Validar que haya productos
    if (!products || products.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Debe incluir al menos un producto' });
    }
    
    // Verificar si hay una caja abierta
    const CashRegister = require('../models/cashRegister.model');
    const currentCashRegister = await CashRegister.findOne({
      where: { status: 'abierto' },
      transaction
    });
    
    if (!currentCashRegister) {
      await transaction.rollback();
      return res.status(400).json({ message: 'No hay una caja abierta. Debe abrir una caja antes de registrar ventas.' });
    }

    // Calcular el total de la venta
    let total = 0;
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
      if (product.wholesalePrice && product.wholesaleMinQuantity && item.quantity >= product.wholesaleMinQuantity) {
        price = product.wholesalePrice;
      }

      // Calcular subtotal
      const subtotal = price * item.quantity;
      total += subtotal;

      // Actualizar stock
      await product.update({ stock: product.stock - item.quantity }, { transaction });
    }

    // Crear la venta
    const sale = await Sale.create({
      clientId,
      userId,
      total,
      invoiceType,
      invoiceNumber,
      notes,
      status: 'pagado', // Por defecto, se considera pagada
      cashRegisterId: currentCashRegister.id // Asignar la caja actual a la venta
    }, { transaction });

    // Crear los detalles de la venta
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      
      // Determinar el precio según la cantidad (mayoreo o unitario)
      let price = product.unitPrice;
      if (product.wholesalePrice && product.wholesaleMinQuantity && item.quantity >= product.wholesaleMinQuantity) {
        price = product.wholesalePrice;
      }

      await SaleDetail.create({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: price,
        subtotal: price * item.quantity
      }, { transaction });
    }

    await transaction.commit();

    return res.status(201).json({
      message: 'Venta registrada correctamente',
      sale
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear venta:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener todas las ventas
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        { model: Client },
        { model: User, as: 'seller', attributes: ['id', 'username'] },
        { 
          model: SaleDetail,
          include: [{ model: Product, attributes: ['id', 'name', 'unitPrice'] }]
        }
      ],
      order: [['date', 'DESC']]
    });

    return res.status(200).json(sales);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener entregas del día (pedidos completados con productos)
exports.getTodaySales = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Obtener pedidos regulares entregados del día
    const { Order, OrderDetail, GuestOrder, GuestOrderProduct } = require('../models');
    
    const regularOrders = await Order.findAll({
      where: {
        createdAt: {
          [Op.between]: [today, tomorrow]
        }
      },
      include: [
        { model: Client, attributes: ['id', 'name', 'email'] },
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { 
          model: OrderDetail,
          as: 'orderDetails',
          include: [{ model: Product, attributes: ['id', 'name', 'unitPrice'] }]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    const guestOrders = await GuestOrder.findAll({
      where: {
        createdAt: {
          [Op.between]: [today, tomorrow]
        }
      },
      include: [
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { 
          model: GuestOrderProduct,
          as: 'products',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unitPrice'] }]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Combinar y formatear las entregas
    const deliveries = [
      ...regularOrders.map(order => ({
        id: order.id,
        type: 'regular',
        clientName: order.Client?.name || 'Cliente frecuente',
        clientEmail: order.Client?.email,
        deliveryPerson: order.deliveryPerson?.username || 'N/A',
        total: order.total,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        status: 'entregado',
        deliveredAt: order.updatedAt,
        address: order.deliveryAddress,
        district: order.deliveryDistrict,
        products: order.orderDetails?.map(detail => ({
          id: detail.Product?.id,
          name: detail.Product?.name,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          subtotal: detail.subtotal
        })) || []
      })),
      ...guestOrders.map(order => ({
        id: order.id,
        type: 'guest',
        clientName: order.clientName || 'Cliente visitante',
        clientEmail: order.clientEmail,
        deliveryPerson: order.deliveryPerson?.username || 'N/A',
        total: order.total,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        status: 'entregado',
        deliveredAt: order.updatedAt,
        address: order.deliveryAddress,
        district: order.deliveryDistrict,
        products: order.products?.map(detail => ({
          id: detail.product?.id,
          name: detail.product?.name,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          subtotal: detail.subtotal
        })) || []
      }))
    ].sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt));

    // Calcular estadísticas de productos
    const productStats = {};
    let totalBidones = 0;
    let totalPaquetes = 0;
    let totalAmount = 0;
    let deliveredAmount = 0;
    let pendingAmount = 0;

    deliveries.forEach(delivery => {
      const amount = parseFloat(delivery.total || 0);
      totalAmount += amount;
      
      if (delivery.status === 'entregado' || delivery.status === 'delivered') {
        deliveredAmount += amount;
      } else {
        pendingAmount += amount;
      }
      
      delivery.products.forEach(product => {
        if (!productStats[product.name]) {
          productStats[product.name] = 0;
        }
        productStats[product.name] += product.quantity;
        
        // Contar bidones y paquetes específicamente
        if (product.name.toLowerCase().includes('bidón')) {
          totalBidones += product.quantity;
        }
        if (product.name.toLowerCase().includes('paquete')) {
          totalPaquetes += product.quantity;
        }
      });
    });

    return res.status(200).json({
      success: true,
      data: deliveries,
      stats: {
        totalOrders: deliveries.length,
        totalAmount,
        deliveredAmount,
        pendingAmount,
        totalBidones,
        totalPaquetes,
        productStats
      }
    });
  } catch (error) {
    console.error('Error al obtener entregas del día:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error en el servidor' 
    });
  }
};

// Obtener una venta por ID
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, {
      include: [
        { model: Client },
        { model: User, as: 'seller', attributes: ['id', 'username'] },
        { 
          model: SaleDetail,
          include: [{ model: Product }]
        }
      ]
    });

    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    return res.status(200).json(sale);
  } catch (error) {
    console.error('Error al obtener venta:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Anular una venta
exports.cancelSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, {
      include: [{ model: SaleDetail }]
    });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    if (sale.status === 'anulado') {
      await transaction.rollback();
      return res.status(400).json({ message: 'La venta ya está anulada' });
    }

    // Restaurar stock de productos
    for (const detail of sale.SaleDetails) {
      const product = await Product.findByPk(detail.productId);
      await product.update({
        stock: product.stock + detail.quantity
      }, { transaction });
    }

    // Actualizar estado de la venta
    await sale.update({ status: 'anulado' }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      message: 'Venta anulada correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al anular venta:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener ventas por cliente
exports.getSalesByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const sales = await Sale.findAll({
      where: { clientId },
      include: [
        { model: Client },
        { model: User, as: 'seller', attributes: ['id', 'username'] }
      ],
      order: [['date', 'DESC']]
    });

    return res.status(200).json(sales);
  } catch (error) {
    console.error('Error al obtener ventas por cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener ventas por fecha
exports.getSalesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const sales = await Sale.findAll({
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [
        { model: Client },
        { model: User, as: 'seller', attributes: ['id', 'username'] }
      ],
      order: [['date', 'DESC']]
    });

    return res.status(200).json(sales);
  } catch (error) {
    console.error('Error al obtener ventas por fecha:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Generar y descargar el PDF de una venta específica
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Archivo PDF de la venta
 */
exports.generateSalePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la venta con todos sus detalles
    const sale = await Sale.findByPk(id, {
      include: [
        { model: Client },
        { model: User, as: 'seller' },
        { model: SaleDetail, include: [Product] }
      ]
    });
    
    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Buscar si ya existe un pago con documento generado para esta venta
    const payment = await Payment.findOne({
      where: { saleId: id },
      attributes: ['documentPath']
    });
    
    // Si ya existe un documento, devolver ese archivo
    if (payment && payment.documentPath) {
      const filePath = path.join(__dirname, '..', '..', payment.documentPath);
      
      if (fs.existsSync(filePath)) {
        return res.download(filePath);
      }
    }
    
    // Preparar los datos para el documento
    const orderData = {
      id: sale.id,
      date: sale.date,
      client: sale.Client,
      items: sale.SaleDetails.map(detail => ({
        name: detail.Product.name,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal
      })),
      subtotal: parseFloat(sale.total) / 1.18, // Asumiendo IGV de 18%
      igv: parseFloat(sale.total) - (parseFloat(sale.total) / 1.18),
      total: parseFloat(sale.total),
      // Incluir información de entrega si existe
      deliveryAddress: sale.deliveryAddress || '',
      deliveryDistrict: sale.deliveryDistrict || '',
      deliveryFee: sale.deliveryFee || 0
    };
    
    // Determinar el tipo de documento
    const documentType = sale.invoiceType === 'factura' ? 'invoice' : 'receipt';
    
    // Generar el PDF
    const pdfPath = await documentGeneratorService.generateDocumentPDF(
      orderData,
      documentType,
      sale.invoiceType === 'factura' ? { ruc: sale.Client.documentNumber, businessName: sale.Client.businessName } : null
    );
    
    // Si no existe un pago asociado, crear uno
    if (!payment) {
      await Payment.create({
        saleId: sale.id,
        amount: sale.total,
        paymentMethod: 'efectivo', // Valor por defecto
        documentType: sale.invoiceType,
        paymentStatus: 'completado',
        documentPath: pdfPath
      });
    } else if (!payment.documentPath) {
      // Actualizar el pago existente con la ruta del documento
      await payment.update({ documentPath: pdfPath });
    }
    
    // Devolver el archivo PDF
    const filePath = path.join(__dirname, '..', '..', pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="factura-${id}.pdf"`);
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Error al generar el PDF de la venta:', error);
    return res.status(500).json({ message: 'Error al generar el PDF de la venta' });
  }
};

// Obtener ventas semanales
exports.getWeeklySales = async (req, res) => {
  try {
    console.log('📅 Obteniendo ventas semanales...');
    
    const { Op } = require('sequelize');
    const { Order, OrderDetail, GuestOrder, GuestOrderProduct, Product, Client, User } = require('../models');
    
    // Calcular inicio y fin de la semana actual
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
    endOfWeek.setHours(23, 59, 59, 999);
    
    console.log(`📅 Semana: ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`);
    
    // Obtener pedidos regulares de la semana
    const regularOrders = await Order.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfWeek, endOfWeek]
        }
      },
      include: [
        { model: Client, attributes: ['id', 'name', 'email'] },
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { 
          model: OrderDetail,
          as: 'orderDetails',
          include: [{ model: Product, attributes: ['id', 'name', 'unitPrice'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Obtener pedidos de visitantes de la semana
    const guestOrders = await GuestOrder.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfWeek, endOfWeek]
        }
      },
      include: [
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { 
          model: GuestOrderProduct,
          as: 'products',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unitPrice'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Formatear datos
    const formattedRegularOrders = regularOrders.map(order => ({
      id: order.id,
      type: 'regular',
      clientName: order.Client?.name || 'N/A',
      clientEmail: order.Client?.email || 'N/A',
      address: order.deliveryAddress,
      district: order.deliveryDistrict,
      total: parseFloat(order.total || 0),
      deliveryFee: parseFloat(order.deliveryFee || 0),
      status: order.status,
      createdAt: order.createdAt,
      deliveredAt: order.status === 'entregado' ? order.updatedAt : null,
      deliveryPerson: order.deliveryPerson?.username || 'N/A',
      products: order.orderDetails?.map(detail => ({
        id: detail.Product?.id,
        name: detail.Product?.name,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal
      })) || []
    }));

    const formattedGuestOrders = guestOrders.map(order => ({
      id: order.id,
      type: 'guest',
      clientName: order.clientName || 'Cliente Visitante',
      clientEmail: order.clientEmail || 'N/A',
      address: order.deliveryAddress,
      district: order.deliveryDistrict,
      total: parseFloat(order.total || 0),
      deliveryFee: parseFloat(order.deliveryFee || 0),
      status: order.status,
      createdAt: order.createdAt,
      deliveredAt: order.status === 'delivered' ? order.updatedAt : null,
      deliveryPerson: order.deliveryPerson?.username || 'N/A',
      products: order.products?.map(detail => ({
        id: detail.product?.id,
        name: detail.product?.name,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal
      })) || []
    }));

    // Combinar y ordenar
    const allOrders = [
      ...formattedRegularOrders.map(order => ({ ...order, deliveredAt: order.deliveredAt || order.createdAt })),
      ...formattedGuestOrders.map(order => ({ ...order, deliveredAt: order.deliveredAt || order.createdAt }))
    ].sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt));

    // Calcular estadísticas
    const productStats = {};
    let totalBidones = 0;
    let totalPaquetes = 0;
    let totalAmount = 0;
    let deliveredAmount = 0;
    let pendingAmount = 0;

    allOrders.forEach(order => {
      const amount = parseFloat(order.total || 0);
      totalAmount += amount;
      
      if (order.status === 'entregado' || order.status === 'delivered') {
        deliveredAmount += amount;
      } else {
        pendingAmount += amount;
      }
      
      order.products.forEach(product => {
        if (!productStats[product.name]) {
          productStats[product.name] = 0;
        }
        productStats[product.name] += product.quantity;
        
        if (product.name.toLowerCase().includes('bidón')) {
          totalBidones += product.quantity;
        }
        if (product.name.toLowerCase().includes('paquete')) {
          totalPaquetes += product.quantity;
        }
      });
    });

    // Calcular estadísticas por día
    const dailyStats = {};
    allOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          orders: 0,
          amount: 0,
          bidones: 0,
          paquetes: 0
        };
      }
      dailyStats[date].orders++;
      dailyStats[date].amount += parseFloat(order.total || 0);
      
      order.products.forEach(product => {
        if (product.name.toLowerCase().includes('bidón')) {
          dailyStats[date].bidones += product.quantity;
        }
        if (product.name.toLowerCase().includes('paquete')) {
          dailyStats[date].paquetes += product.quantity;
        }
      });
    });

    return res.status(200).json({
      success: true,
      data: allOrders,
      stats: {
        totalOrders: allOrders.length,
        totalAmount,
        deliveredAmount,
        pendingAmount,
        totalBidones,
        totalPaquetes,
        productStats,
        dailyStats: Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date))
      },
      period: {
        start: startOfWeek,
        end: endOfWeek,
        type: 'weekly'
      }
    });

  } catch (error) {
    console.error('Error al obtener ventas semanales:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener ventas mensuales
exports.getMonthlySales = async (req, res) => {
  try {
    console.log('📅 Obteniendo ventas mensuales...');
    
    const { Op } = require('sequelize');
    const { Order, OrderDetail, GuestOrder, GuestOrderProduct, Product, Client, User } = require('../models');
    
    // Calcular inicio y fin del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    console.log(`📅 Mes: ${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`);
    
    // Obtener pedidos regulares del mes
    const regularOrders = await Order.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      },
      include: [
        { model: Client, attributes: ['id', 'name', 'email'] },
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { 
          model: OrderDetail,
          as: 'orderDetails',
          include: [{ model: Product, attributes: ['id', 'name', 'unitPrice'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Obtener pedidos de visitantes del mes
    const guestOrders = await GuestOrder.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      },
      include: [
        { model: User, as: 'deliveryPerson', attributes: ['id', 'username'] },
        { 
          model: GuestOrderProduct,
          as: 'products',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unitPrice'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Formatear datos (mismo código que semanal)
    const formattedRegularOrders = regularOrders.map(order => ({
      id: order.id,
      type: 'regular',
      clientName: order.Client?.name || 'N/A',
      clientEmail: order.Client?.email || 'N/A',
      address: order.deliveryAddress,
      district: order.deliveryDistrict,
      total: parseFloat(order.total || 0),
      deliveryFee: parseFloat(order.deliveryFee || 0),
      status: order.status,
      createdAt: order.createdAt,
      deliveredAt: order.status === 'entregado' ? order.updatedAt : null,
      deliveryPerson: order.deliveryPerson?.username || 'N/A',
      products: order.orderDetails?.map(detail => ({
        id: detail.Product?.id,
        name: detail.Product?.name,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal
      })) || []
    }));

    const formattedGuestOrders = guestOrders.map(order => ({
      id: order.id,
      type: 'guest',
      clientName: order.clientName || 'Cliente Visitante',
      clientEmail: order.clientEmail || 'N/A',
      address: order.deliveryAddress,
      district: order.deliveryDistrict,
      total: parseFloat(order.total || 0),
      deliveryFee: parseFloat(order.deliveryFee || 0),
      status: order.status,
      createdAt: order.createdAt,
      deliveredAt: order.status === 'delivered' ? order.updatedAt : null,
      deliveryPerson: order.deliveryPerson?.username || 'N/A',
      products: order.products?.map(detail => ({
        id: detail.product?.id,
        name: detail.product?.name,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal
      })) || []
    }));

    // Combinar y ordenar
    const allOrders = [
      ...formattedRegularOrders.map(order => ({ ...order, deliveredAt: order.deliveredAt || order.createdAt })),
      ...formattedGuestOrders.map(order => ({ ...order, deliveredAt: order.deliveredAt || order.createdAt }))
    ].sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt));

    // Calcular estadísticas
    const productStats = {};
    let totalBidones = 0;
    let totalPaquetes = 0;
    let totalAmount = 0;
    let deliveredAmount = 0;
    let pendingAmount = 0;

    allOrders.forEach(order => {
      const amount = parseFloat(order.total || 0);
      totalAmount += amount;
      
      if (order.status === 'entregado' || order.status === 'delivered') {
        deliveredAmount += amount;
      } else {
        pendingAmount += amount;
      }
      
      order.products.forEach(product => {
        if (!productStats[product.name]) {
          productStats[product.name] = 0;
        }
        productStats[product.name] += product.quantity;
        
        if (product.name.toLowerCase().includes('bidón')) {
          totalBidones += product.quantity;
        }
        if (product.name.toLowerCase().includes('paquete')) {
          totalPaquetes += product.quantity;
        }
      });
    });

    // Calcular estadísticas por semana
    const weeklyStats = {};
    allOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toLocaleDateString();
      
      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = {
          week: weekKey,
          orders: 0,
          amount: 0,
          bidones: 0,
          paquetes: 0
        };
      }
      weeklyStats[weekKey].orders++;
      weeklyStats[weekKey].amount += parseFloat(order.total || 0);
      
      order.products.forEach(product => {
        if (product.name.toLowerCase().includes('bidón')) {
          weeklyStats[weekKey].bidones += product.quantity;
        }
        if (product.name.toLowerCase().includes('paquete')) {
          weeklyStats[weekKey].paquetes += product.quantity;
        }
      });
    });

    return res.status(200).json({
      success: true,
      data: allOrders,
      stats: {
        totalOrders: allOrders.length,
        totalAmount,
        deliveredAmount,
        pendingAmount,
        totalBidones,
        totalPaquetes,
        productStats,
        weeklyStats: Object.values(weeklyStats).sort((a, b) => new Date(a.week) - new Date(b.week))
      },
      period: {
        start: startOfMonth,
        end: endOfMonth,
        type: 'monthly'
      }
    });

  } catch (error) {
    console.error('Error al obtener ventas mensuales:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};